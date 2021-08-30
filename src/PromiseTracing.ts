import { addBreadcrumb } from '@sentry/core';
import { Breadcrumb, Integration, Severity } from '@sentry/types';
import { isBrowser, isNode } from './helpers';

export class PatchedPromise<T> extends Promise<T> {
  public readonly stack?: string;
  public readonly timestamp?: number;
  constructor(executor: () => void) {
    const { stack } = new Error('Promise created');
    super(executor); // call native Promise constructor
    this.timestamp = new Date().getTime();
    this.stack = stack;
  }
}

function getPromiseBreadcrumb(promise: PatchedPromise<never>): Breadcrumb {
  const { stack, timestamp } = promise;
  return {
    type: 'error',
    message: 'Rejected promise',
    category: 'promise',
    level: Severity.Error,
    data: { stack, timestamp },
  };
}

export function browserHandler(event: { promise: Promise<never> }): void {
  addBreadcrumb(getPromiseBreadcrumb(event.promise as PatchedPromise<never>));
}

export function nodeHandler(_error: Error, promise: Promise<never>): void {
  addBreadcrumb(getPromiseBreadcrumb(promise as PatchedPromise<never>));
}

export function withPromiseTracing(
  headIntegrations: Integration[] = [],
  tailIntegrations: Integration[] = []
): (Integration: Integration[]) => Integration[] {
  return (integrations: Integration[]) => [
    new PromiseTracing(),
    ...headIntegrations,
    ...integrations,
    ...tailIntegrations,
  ];
}

export class PromiseTracing implements Integration {
  public static id = 'PromiseTracing';
  public name = PromiseTracing.id;

  public setupOnce(): void {
    if (isBrowser()) {
      window.addEventListener(
        'unhandledrejection',
        browserHandler as unknown as EventListenerOrEventListenerObject
      );
    }
    if (isNode()) {
      process.on('unhandledRejection', nodeHandler);
    }
    global.Promise = PatchedPromise as PromiseConstructor;
  }
}
