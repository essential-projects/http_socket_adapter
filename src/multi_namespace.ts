import {IIdentity} from '@essential-projects/iam_contracts';
import {IEndpointSocketScope, ISocketClient, OnConnectCallback} from '@essential-projects/websocket_contracts';

export class MultiSocketNamespace implements IEndpointSocketScope {

  private _namespaceIdentifier: string = undefined;
  private _socketNamespaces: Array<IEndpointSocketScope> = undefined;

  constructor(namespaceIdentifier: string, socketNamespaces: Array<IEndpointSocketScope>) {
    this._namespaceIdentifier = namespaceIdentifier;
    this._socketNamespaces = socketNamespaces;
  }

  public get namespaceIdentifier(): string {
    return this._namespaceIdentifier;
  }

  public get socketNamespaces(): Array<IEndpointSocketScope> {
    return this._socketNamespaces;
  }

  public onConnect(callback: OnConnectCallback): void {

    for (const socketNamespace of this.socketNamespaces) {
      socketNamespace.onConnect(callback);
    }
  }

  public emit<TMessage>(eventType: string, message: TMessage): void {

    for (const socketNamespace of this.socketNamespaces) {
      socketNamespace.emit(eventType, message);
    }
  }
}
