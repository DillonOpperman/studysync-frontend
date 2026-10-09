import { GroupChatSocket } from '../src/features/chat/wsClient';

class FakeSocket {
  static instances: FakeSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 0;
  sent: string[] = [];
  url: string;

  constructor(url: string) {
    this.url = url;
    FakeSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
  }

  open() {
    this.readyState = 1;
    this.onopen?.();
  }

  incoming(data: string) {
    this.onmessage?.({ data });
  }
}

describe('GroupChatSocket (mocked WebSocket — not a live Rust server)', () => {
  beforeEach(() => {
    FakeSocket.instances = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('subscribes after connect, pings, and ignores stale generations', () => {
    const socket = new GroupChatSocket(
      {
        getAccessToken: () => 'access.jwt',
        refreshAccessToken: async () => 'access.jwt',
      },
      FakeSocket as unknown as typeof WebSocket,
    );
    const events: string[] = [];
    socket.connect('g1', {
      onEvent: event => events.push(event.op),
      onStatus: status => events.push(status),
    });
    expect(FakeSocket.instances[0].url).toContain('access_token=access.jwt');
    FakeSocket.instances[0].open();
    expect(FakeSocket.instances[0].sent[0]).toContain('"op":"subscribe"');
    FakeSocket.instances[0].incoming(
      JSON.stringify({ op: 'subscribed', groupId: 'g1' }),
    );
    expect(socket.isSubscribed()).toBe(true);
    jest.advanceTimersByTime(25000);
    expect(FakeSocket.instances[0].sent.some(row => row.includes('ping'))).toBe(
      true,
    );
    socket.disconnect();
    FakeSocket.instances[0].incoming(
      JSON.stringify({
        op: 'message.created',
        payload: { id: 'late', groupId: 'g1' },
      }),
    );
    expect(events).not.toContain('message.created');
  });

  it('reconnects with backoff after an unexpected close and stops when paused', async () => {
    let token: string | null = 'old';
    const refreshAccessToken = jest.fn(async () => {
      token = 'new';
      return token;
    });
    const socket = new GroupChatSocket(
      {
        getAccessToken: () => token,
        refreshAccessToken,
      },
      FakeSocket as unknown as typeof WebSocket,
    );
    const statuses: string[] = [];
    socket.connect('g1', {
      onEvent: () => undefined,
      onStatus: status => statuses.push(status),
    });
    FakeSocket.instances[0].open();
    FakeSocket.instances[0].onclose?.();
    await Promise.resolve();
    await Promise.resolve();
    expect(refreshAccessToken).toHaveBeenCalled();
    expect(statuses).toContain('reconnecting');
    jest.advanceTimersByTime(35_000);
    expect(FakeSocket.instances.length).toBeGreaterThan(1);
    socket.disconnect();
  });

  it('fails closed when there is no access token', () => {
    const onAuthFailure = jest.fn();
    const socket = new GroupChatSocket(
      {
        getAccessToken: () => null,
        refreshAccessToken: async () => null,
      },
      FakeSocket as unknown as typeof WebSocket,
    );
    socket.connect('g1', {
      onEvent: () => undefined,
      onStatus: () => undefined,
      onAuthFailure,
    });
    expect(onAuthFailure).toHaveBeenCalled();
    expect(FakeSocket.instances).toHaveLength(0);
  });
});
