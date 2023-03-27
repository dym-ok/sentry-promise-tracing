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

import { Integration } from '@sentry/types';
import { ERROR_SEVERITY } from './helpers';

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
  it('should put PromiseTracing integration before all the other integrations', () => {
    const defaultIntegration = { name: 'DefaultIntegration' } as Integration;
    const resultingIntegrations = withPromiseTracing()([defaultIntegration]);

    expect(resultingIntegrations).toHaveLength(2);
    expect(resultingIntegrations[0].name).toBe(PromiseTracing.id);
    expect(resultingIntegrations[1]).toBe(defaultIntegration);
  });

  it('should put default integrations in between head and tail integrations', () => {
    const headIntegration = { name: 'HeadIntegration' } as Integration;
    const tailIntegration = { name: 'TailIntegration' } as Integration;
    const defaultIntegration = { name: 'DefaultIntegration' } as Integration;
    const resultingIntegrations = withPromiseTracing(
      [headIntegration],
      [tailIntegration]
    )([defaultIntegration]);

    expect(resultingIntegrations).toHaveLength(4);
    expect(resultingIntegrations[1]).toBe(headIntegration);
    expect(resultingIntegrations[2]).toBe(defaultIntegration);
    expect(resultingIntegrations[3]).toBe(tailIntegration);
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
      level: ERROR_SEVERITY,
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
      level: ERROR_SEVERITY,
      data: {
        stack: 'Some error stack',
        timestamp: 0,
      },
    });
  });
});
