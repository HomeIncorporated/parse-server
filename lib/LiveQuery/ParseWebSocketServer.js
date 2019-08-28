"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParseWebSocket = exports.ParseWebSocketServer = void 0;

var _AdapterLoader = require("../Adapters/AdapterLoader");

var _WSAdapter = require("../Adapters/WebSocketServer/WSAdapter");

var _logger = _interopRequireDefault(require("../logger"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ParseWebSocketServer {
  constructor(server, onConnect, config) {
    config.server = server;
    const wss = (0, _AdapterLoader.loadAdapter)(config.wssAdapter, _WSAdapter.WSAdapter, config);

    wss.onListen = () => {
      _logger.default.info('Parse LiveQuery Server starts running');
    };

    wss.onConnection = ws => {
      onConnect(new ParseWebSocket(ws)); // Send ping to client periodically

      const pingIntervalId = setInterval(() => {
        if (ws.readyState == ws.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingIntervalId);
        }
      }, config.websocketTimeout || 10 * 1000);
    };

    wss.start();
    this.server = wss;
  }

  close() {
    if (this.server && this.server.close) {
      this.server.close();
    }
  }

}

exports.ParseWebSocketServer = ParseWebSocketServer;

class ParseWebSocket extends _events.default.EventEmitter {
  constructor(ws) {
    super();

    ws.onmessage = request => this.emit('message', request && request.data ? request.data : request);

    ws.onclose = () => this.emit('disconnect');

    this.ws = ws;
  }

  send(message) {
    this.ws.send(message);
  }

}

exports.ParseWebSocket = ParseWebSocket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9MaXZlUXVlcnkvUGFyc2VXZWJTb2NrZXRTZXJ2ZXIuanMiXSwibmFtZXMiOlsiUGFyc2VXZWJTb2NrZXRTZXJ2ZXIiLCJjb25zdHJ1Y3RvciIsInNlcnZlciIsIm9uQ29ubmVjdCIsImNvbmZpZyIsIndzcyIsIndzc0FkYXB0ZXIiLCJXU0FkYXB0ZXIiLCJvbkxpc3RlbiIsImxvZ2dlciIsImluZm8iLCJvbkNvbm5lY3Rpb24iLCJ3cyIsIlBhcnNlV2ViU29ja2V0IiwicGluZ0ludGVydmFsSWQiLCJzZXRJbnRlcnZhbCIsInJlYWR5U3RhdGUiLCJPUEVOIiwicGluZyIsImNsZWFySW50ZXJ2YWwiLCJ3ZWJzb2NrZXRUaW1lb3V0Iiwic3RhcnQiLCJjbG9zZSIsImV2ZW50cyIsIkV2ZW50RW1pdHRlciIsIm9ubWVzc2FnZSIsInJlcXVlc3QiLCJlbWl0IiwiZGF0YSIsIm9uY2xvc2UiLCJzZW5kIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRU8sTUFBTUEsb0JBQU4sQ0FBMkI7QUFHaENDLEVBQUFBLFdBQVcsQ0FBQ0MsTUFBRCxFQUFjQyxTQUFkLEVBQW1DQyxNQUFuQyxFQUEyQztBQUNwREEsSUFBQUEsTUFBTSxDQUFDRixNQUFQLEdBQWdCQSxNQUFoQjtBQUNBLFVBQU1HLEdBQUcsR0FBRyxnQ0FBWUQsTUFBTSxDQUFDRSxVQUFuQixFQUErQkMsb0JBQS9CLEVBQTBDSCxNQUExQyxDQUFaOztBQUNBQyxJQUFBQSxHQUFHLENBQUNHLFFBQUosR0FBZSxNQUFNO0FBQ25CQyxzQkFBT0MsSUFBUCxDQUFZLHVDQUFaO0FBQ0QsS0FGRDs7QUFHQUwsSUFBQUEsR0FBRyxDQUFDTSxZQUFKLEdBQW1CQyxFQUFFLElBQUk7QUFDdkJULE1BQUFBLFNBQVMsQ0FBQyxJQUFJVSxjQUFKLENBQW1CRCxFQUFuQixDQUFELENBQVQsQ0FEdUIsQ0FFdkI7O0FBQ0EsWUFBTUUsY0FBYyxHQUFHQyxXQUFXLENBQUMsTUFBTTtBQUN2QyxZQUFJSCxFQUFFLENBQUNJLFVBQUgsSUFBaUJKLEVBQUUsQ0FBQ0ssSUFBeEIsRUFBOEI7QUFDNUJMLFVBQUFBLEVBQUUsQ0FBQ00sSUFBSDtBQUNELFNBRkQsTUFFTztBQUNMQyxVQUFBQSxhQUFhLENBQUNMLGNBQUQsQ0FBYjtBQUNEO0FBQ0YsT0FOaUMsRUFNL0JWLE1BQU0sQ0FBQ2dCLGdCQUFQLElBQTJCLEtBQUssSUFORCxDQUFsQztBQU9ELEtBVkQ7O0FBV0FmLElBQUFBLEdBQUcsQ0FBQ2dCLEtBQUo7QUFDQSxTQUFLbkIsTUFBTCxHQUFjRyxHQUFkO0FBQ0Q7O0FBRURpQixFQUFBQSxLQUFLLEdBQUc7QUFDTixRQUFJLEtBQUtwQixNQUFMLElBQWUsS0FBS0EsTUFBTCxDQUFZb0IsS0FBL0IsRUFBc0M7QUFDcEMsV0FBS3BCLE1BQUwsQ0FBWW9CLEtBQVo7QUFDRDtBQUNGOztBQTVCK0I7Ozs7QUErQjNCLE1BQU1ULGNBQU4sU0FBNkJVLGdCQUFPQyxZQUFwQyxDQUFpRDtBQUd0RHZCLEVBQUFBLFdBQVcsQ0FBQ1csRUFBRCxFQUFVO0FBQ25COztBQUNBQSxJQUFBQSxFQUFFLENBQUNhLFNBQUgsR0FBZUMsT0FBTyxJQUNwQixLQUFLQyxJQUFMLENBQVUsU0FBVixFQUFxQkQsT0FBTyxJQUFJQSxPQUFPLENBQUNFLElBQW5CLEdBQTBCRixPQUFPLENBQUNFLElBQWxDLEdBQXlDRixPQUE5RCxDQURGOztBQUVBZCxJQUFBQSxFQUFFLENBQUNpQixPQUFILEdBQWEsTUFBTSxLQUFLRixJQUFMLENBQVUsWUFBVixDQUFuQjs7QUFDQSxTQUFLZixFQUFMLEdBQVVBLEVBQVY7QUFDRDs7QUFFRGtCLEVBQUFBLElBQUksQ0FBQ0MsT0FBRCxFQUFxQjtBQUN2QixTQUFLbkIsRUFBTCxDQUFRa0IsSUFBUixDQUFhQyxPQUFiO0FBQ0Q7O0FBYnFEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9hZEFkYXB0ZXIgfSBmcm9tICcuLi9BZGFwdGVycy9BZGFwdGVyTG9hZGVyJztcbmltcG9ydCB7IFdTQWRhcHRlciB9IGZyb20gJy4uL0FkYXB0ZXJzL1dlYlNvY2tldFNlcnZlci9XU0FkYXB0ZXInO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuLi9sb2dnZXInO1xuaW1wb3J0IGV2ZW50cyBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgUGFyc2VXZWJTb2NrZXRTZXJ2ZXIge1xuICBzZXJ2ZXI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihzZXJ2ZXI6IGFueSwgb25Db25uZWN0OiBGdW5jdGlvbiwgY29uZmlnKSB7XG4gICAgY29uZmlnLnNlcnZlciA9IHNlcnZlcjtcbiAgICBjb25zdCB3c3MgPSBsb2FkQWRhcHRlcihjb25maWcud3NzQWRhcHRlciwgV1NBZGFwdGVyLCBjb25maWcpO1xuICAgIHdzcy5vbkxpc3RlbiA9ICgpID0+IHtcbiAgICAgIGxvZ2dlci5pbmZvKCdQYXJzZSBMaXZlUXVlcnkgU2VydmVyIHN0YXJ0cyBydW5uaW5nJyk7XG4gICAgfTtcbiAgICB3c3Mub25Db25uZWN0aW9uID0gd3MgPT4ge1xuICAgICAgb25Db25uZWN0KG5ldyBQYXJzZVdlYlNvY2tldCh3cykpO1xuICAgICAgLy8gU2VuZCBwaW5nIHRvIGNsaWVudCBwZXJpb2RpY2FsbHlcbiAgICAgIGNvbnN0IHBpbmdJbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAod3MucmVhZHlTdGF0ZSA9PSB3cy5PUEVOKSB7XG4gICAgICAgICAgd3MucGluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwocGluZ0ludGVydmFsSWQpO1xuICAgICAgICB9XG4gICAgICB9LCBjb25maWcud2Vic29ja2V0VGltZW91dCB8fCAxMCAqIDEwMDApO1xuICAgIH07XG4gICAgd3NzLnN0YXJ0KCk7XG4gICAgdGhpcy5zZXJ2ZXIgPSB3c3M7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIgJiYgdGhpcy5zZXJ2ZXIuY2xvc2UpIHtcbiAgICAgIHRoaXMuc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVdlYlNvY2tldCBleHRlbmRzIGV2ZW50cy5FdmVudEVtaXR0ZXIge1xuICB3czogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHdzOiBhbnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHdzLm9ubWVzc2FnZSA9IHJlcXVlc3QgPT5cbiAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIHJlcXVlc3QgJiYgcmVxdWVzdC5kYXRhID8gcmVxdWVzdC5kYXRhIDogcmVxdWVzdCk7XG4gICAgd3Mub25jbG9zZSA9ICgpID0+IHRoaXMuZW1pdCgnZGlzY29ubmVjdCcpO1xuICAgIHRoaXMud3MgPSB3cztcbiAgfVxuXG4gIHNlbmQobWVzc2FnZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy53cy5zZW5kKG1lc3NhZ2UpO1xuICB9XG59XG4iXX0=