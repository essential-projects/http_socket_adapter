import {IContainer, IInstanceWrapper} from 'addict-ioc';
import * as http from 'http';

import {socketAdapterDiscoveryTag} from '@essential-projects/http_contracts';
import {IHttpSocketAdapter} from '@essential-projects/http_socket_adapter_contracts';
import {IEndpointSocketScope, OnConnectCallback} from '@essential-projects/websocket_contracts';
import {MultiSocketNamespace} from './multi_namespace';

type SocketAdapterCollection = { [socketAdapterName: string]: IHttpSocketAdapter };

export class MultiHttpSocketAdapter implements IHttpSocketAdapter, IEndpointSocketScope {

  private _container: IContainer<IInstanceWrapper<any>> = undefined;
  private _socketAdapters: SocketAdapterCollection = {};
  private _httpServer: http.Server = undefined;

  constructor(container: IContainer<IInstanceWrapper<any>>) {
    this._container = container;
  }

  public get container(): IContainer<IInstanceWrapper<any>> {
    return this._container;
  }

  public get httpServer(): http.Server {
    return this._httpServer;
  }

  public get socketAdapters(): SocketAdapterCollection {
    return this._socketAdapters;
  }

  public async initializeAdapter(httpServer: http.Server): Promise<void> {

    this._httpServer = httpServer;

    const allSocketAdapters: Array<string> = this.container.getKeysByTags(socketAdapterDiscoveryTag);

    for (const socketAdapterName of allSocketAdapters) {
      await this._initializeSocketAdapter(socketAdapterName);
    }
  }

  public getNamespace(namespaceIdentifier: string): IEndpointSocketScope {
    const socketAdapters: Array<IHttpSocketAdapter> = Object.values(this._socketAdapters);

    return new MultiSocketNamespace(namespaceIdentifier, socketAdapters);
  }

  private async _initializeSocketAdapter(socketAdapterName: string): Promise<void> {

    const socketAdapterIsNotRegistered: boolean = !this.container.isRegistered(socketAdapterName);
    if (socketAdapterIsNotRegistered) {
      throw new Error(`There is no socket adapter registered for key '${socketAdapterName}'`);
    }

    const socketAdapterInstance: IHttpSocketAdapter = await this.container.resolveAsync<IHttpSocketAdapter>(socketAdapterName);

    await socketAdapterInstance.initializeAdapter(this.httpServer);

    this._socketAdapters[socketAdapterName] = socketAdapterInstance;
  }

  public async dispose(): Promise<void> {

    for (const socketAdapterName in this.socketAdapters) {
      const socketAdapterInstance: IHttpSocketAdapter = this.socketAdapters[socketAdapterName];

      await socketAdapterInstance.dispose();
    }
  }

  public onConnect(callback: OnConnectCallback): void {

    for (const socketAdapterName in this.socketAdapters) {
      const socketAdapterInstance: IHttpSocketAdapter = this.socketAdapters[socketAdapterName];

      socketAdapterInstance.onConnect(callback);
    }
  }

  public emit<TMessage>(eventType: string, message: TMessage): void {

    for (const socketAdapterName in this.socketAdapters) {
      const socketAdapterInstance: IHttpSocketAdapter = this.socketAdapters[socketAdapterName];

      socketAdapterInstance.emit(eventType, message);
    }
  }
}
