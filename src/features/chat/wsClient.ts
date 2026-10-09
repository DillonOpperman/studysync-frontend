import { authenticatedWsUrl } from '../../config/env';
import { parseServerEvent, type ClientOp, type ServerEvent } from './protocol';
import { reconnectDelayMs, shouldPauseReconnect } from './reconnect';

export type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'subscribed'
  | 'reconnecting'
  | 'disconnected';

export type TokenSource = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

export type GroupChatSocketHandlers = {
  onEvent: (event: ServerEvent) => void;
  onStatus: (status: SocketStatus) => void;
  onAuthFailure?: () => void;
};

const PING_MS = 25_000;

export class GroupChatSocket {
  private socket: WebSocket | null = null;
  private generation = 0;
  private groupId: string | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private closedByUser = false;
  private handlers: GroupChatSocketHandlers | null = null;
  private subscribed = false;

  constructor(
    private readonly tokens: TokenSource,
    private readonly WebSocketImpl: typeof WebSocket = WebSocket,
  ) {}

  get statusGroupId(): string | null {
    return this.groupId;
  }

  connect(groupId: string, handlers: GroupChatSocketHandlers) {
    this.closedByUser = false;
    this.groupId = groupId;
    this.handlers = handlers;
    this.attempts = 0;
    this.open();
  }

  disconnect() {
    this.closedByUser = true;
    this.generation += 1;
    this.clearTimers();
    this.subscribed = false;
    this.closeSocket();
    this.groupId = null;
    this.handlers = null;
  }

  pause() {
    this.closedByUser = true;
    this.generation += 1;
    this.clearTimers();
    this.subscribed = false;
    this.closeSocket();
    this.handlers?.onStatus('disconnected');
  }

  resume() {
    if (!this.groupId || !this.handlers) {
      return;
    }
    this.closedByUser = false;
    this.attempts = 0;
    this.open();
  }

  isSubscribed(): boolean {
    return this.subscribed && this.socket?.readyState === WebSocket.OPEN;
  }

  sendOp(op: ClientOp): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    this.socket.send(JSON.stringify(op));
    return true;
  }

  private open() {
    this.generation += 1;
    const gen = this.generation;
    this.clearTimers();
    this.closeSocket();
    this.subscribed = false;
    const token = this.tokens.getAccessToken();
    if (!token) {
      this.handlers?.onStatus('disconnected');
      this.handlers?.onAuthFailure?.();
      return;
    }
    this.handlers?.onStatus(this.attempts > 0 ? 'reconnecting' : 'connecting');
    // Token is required as a query param by the backend. Do not log this URL.
    const socket = new this.WebSocketImpl(authenticatedWsUrl(token));
    this.socket = socket;

    socket.onopen = () => {
      if (gen !== this.generation) {
        return;
      }
      this.attempts = 0;
      this.handlers?.onStatus('open');
      if (this.groupId) {
        this.sendOp({ op: 'subscribe', groupId: this.groupId });
      }
      this.pingTimer = setInterval(() => {
        if (gen !== this.generation) {
          return;
        }
        this.sendOp({ op: 'ping', ts: Date.now() });
      }, PING_MS);
    };

    socket.onmessage = event => {
      if (gen !== this.generation) {
        return;
      }
      const parsed = parseServerEvent(String(event.data));
      if (!parsed) {
        return;
      }
      if (parsed.op === 'subscribed' && parsed.groupId === this.groupId) {
        this.subscribed = true;
        this.handlers?.onStatus('subscribed');
      }
      this.handlers?.onEvent(parsed);
    };

    socket.onerror = () => {
      if (gen !== this.generation) {
        return;
      }
      this.handlers?.onStatus('disconnected');
    };

    socket.onclose = () => {
      if (gen !== this.generation) {
        return;
      }
      this.subscribed = false;
      this.clearTimers();
      if (this.closedByUser) {
        this.handlers?.onStatus('disconnected');
        return;
      }
      this.scheduleReconnect(gen).catch(() => undefined);
    };
  }

  private async scheduleReconnect(gen: number) {
    if (this.closedByUser || gen !== this.generation) {
      return;
    }
    this.attempts += 1;
    if (shouldPauseReconnect(this.attempts)) {
      this.handlers?.onStatus('disconnected');
      return;
    }
    this.handlers?.onStatus('reconnecting');
    const refreshed = await this.tokens.refreshAccessToken().catch(() => null);
    if (this.closedByUser || gen !== this.generation) {
      return;
    }
    if (!this.tokens.getAccessToken() && !refreshed) {
      this.handlers?.onAuthFailure?.();
      this.handlers?.onStatus('disconnected');
      return;
    }
    const delay = reconnectDelayMs(this.attempts - 1);
    this.reconnectTimer = setTimeout(() => {
      if (this.closedByUser || gen !== this.generation) {
        return;
      }
      this.open();
    }, delay);
  }

  private closeSocket() {
    if (!this.socket) {
      return;
    }
    const socket = this.socket;
    this.socket = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  }

  private clearTimers() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
