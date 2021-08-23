const mockAddBreadcrumb = jest.fn();
jest.mock('@sentry/core', () => ({
  addBreadcrumb: mockAddBreadcrumb,
}));

const mockIsBrowser = jest.fn();
const mockIsNode = jest.fn();
jest.mock('./helpers', () => ({
  isBrowser: mockIsBrowser,
  isNode: mockIsNode,
}));

import { Integration, Severity } from '@sentry/types';
import {
  browserHandler,
  nodeHandler,
  PatchedPromise,
  PromiseTracing,
  withPromiseTracing,
} from './PromiseTracing';

let addEventListenerSpy: jest.SpyInstance;
let processOnSpy: jest.SpyInstance;

beforeEach(() => {
  addEventListenerSpy = jest.spyOn(window, 'addEventListener');
  processOnSpy = jest.spyOn(process, 'on');
});

afterEach(() => {
  addEventListenerSpy.mockRestore();
  processOnSpy.mockRestore();
  mockAddBreadcrumb.mockClear();
});

describe('PatchedPromise constructor', () => {
  it('adds trace and timestamp properties to the Promise object', () => {
    const testPromise = new PatchedPromise(() => 'OK');

    expect(testPromise.stack).toEqual(expect.stringContaining('Promise created'));
    expect(testPromise.timestamp).toEqual(expect.any(Number));
  });
});

describe('PromiseTracing integration', () => {
  afterEach(() => {
    mockIsBrowser.mockClear();
    mockIsNode.mockClear();
  });

  describe('when running in browser', () => {
    beforeEach(() => {
      mockIsBrowser.mockReturnValue(true);
      mockIsNode.mockReturnValue(false);
    });

    it('setupOnce registers handler for unhandledrejection event', () => {
      const integration = new PromiseTracing();
      integration.setupOnce();

      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', browserHandler);
      expect(processOnSpy).not.toHaveBeenCalled();
    });
  });

  describe('when running in NodeJS', () => {
    beforeEach(() => {
      mockIsBrowser.mockReturnValue(false);
      mockIsNode.mockReturnValue(true);
    });

    it('setupOnce registers handler for unhandledRejection event', () => {
      const integration = new PromiseTracing();
      integration.setupOnce();

      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', nodeHandler);
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });
});

describe('withPromiseTracing', () => {
  it('should put PromiseTracing integration before all the others', () => {
    const someIntegration = { name: 'SomeIntegration' } as Integration;
    const resultingIntegrations = withPromiseTracing([someIntegration]);

    expect(resultingIntegrations).toHaveLength(2);
    expect(resultingIntegrations[0].name).toBe(PromiseTracing.id);
    expect(resultingIntegrations[1]).toBe(someIntegration);
  });
});

describe('browserHandler', () => {
  const testUnhandledPromiseEvent = {
    promise: {
      stack: 'Some error stack',
      timestamp: 0,
    },
  } as unknown as { promise: Promise<never> };

  it('should call addBreadcrumb with promise data', () => {
    browserHandler(testUnhandledPromiseEvent);

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      type: 'error',
      message: 'Rejected promise',
      category: 'promise',
      level: Severity.Error,
      data: {
        stack: 'Some error stack',
        timestamp: 0,
      },
    });
  });
});

describe('nodeHandler', () => {
  it('should call addBreadcrumb with promise data', () => {
    const testUnhandledPromise = {
      stack: 'Some error stack',
      timestamp: 0,
    } as unknown as Promise<never>;

    nodeHandler(new Error('some error'), testUnhandledPromise);

    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1);
    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      type: 'error',
      message: 'Rejected promise',
      category: 'promise',
      level: Severity.Error,
      data: {
        stack: 'Some error stack',
        timestamp: 0,
      },
    });
  });
});
