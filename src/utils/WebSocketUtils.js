import { webSocket } from 'rxjs/webSocket';
import { retryWhen, delayWhen, catchError} from 'rxjs/operators';
import { timer, of , tap} from 'rxjs';

export const setupWebSocket = (webSocketURL) => {
  const socket = webSocket(webSocketURL);

  const reqBody = {
    $: "request.body.action",
    action: "getRequest",
    req : 
    {
        event_type: "connect",
        params: {}
      }
  };

  // const retryObservable = socket.pipe(
  //   retryWhen((errors) =>
  //     errors.pipe(
  //       delayWhen(() => timer(1000)), // Adjust the delay as needed
  //       catchError((err) => {
  //         // Handle retry errors here
  //         sessionStorage.removeItem('connectionId');
  //         return of(err);
  //       })
  //     )
  //   )
  // );
  // Removing retry

  const retryObservable = socket.pipe(
    tap(() => console.log('connected')),
  )

  return { socket, retryObservable,reqBody };
};
