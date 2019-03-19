import {IHttpSocketAdapter} from '@essential-projects/http_socket_adapter_contracts';
import {IEndpointSocketScope, OnConnectCallback} from '@essential-projects/websocket_contracts';

export class MultiSocketNamespace implements IEndpointSocketScope {

  private _namespaceIdentifier: string = undefined;
  private _socketAdapters: Array<IHttpSocketAdapter> = undefined;

  constructor(namespaceIdentifier: string, socketAdapters: Array<IHttpSocketAdapter>) {
    this._namespaceIdentifier = namespaceIdentifier;
    this._socketAdapters = socketAdapters;
  }

  public get namespaceIdentifier(): string {
    return this._namespaceIdentifier;
  }

  public get socketAdapters(): Array<IHttpSocketAdapter> {
    return this._socketAdapters;
  }

  public onConnect(callback: OnConnectCallback): void {

    for (const socketAdapter of this.socketAdapters) {
      const namespace: IEndpointSocketScope = socketAdapter.getNamespace(this.namespaceIdentifier);
      namespace.onConnect(callback);
    }
  }

  public emit<TMessage>(eventType: string, message: TMessage): void {

    for (const socketAdapter of this.socketAdapters) {
      const namespace: IEndpointSocketScope = socketAdapter.getNamespace(this.namespaceIdentifier);
      namespace.emit(eventType, message);
    }
  }
}
