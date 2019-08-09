// function fnMethod(event) {
//     // detects fn + key combo..
//     if (timer != null) {
//         console.log('(fn | r Alt) then  ', event.rawcode);
//         clearTimeout(timer);
//         timer = null;
//         react(event);
//     }
//     if (event.rawcode == 255 || event.rawcode == 165) {
//         // fn key is pressed
//         if (timer != null) clearTimeout(timer);
//         console.log('waiting for next key');
//         makeClientActive(clientPID);
//         // hide current window
//         minimizeCurrentWindow();
//         // minimizeCurrentWindow()
//         timer = setTimeout(() => {
//             console.log('timed out');
//             clearTimeout(timer);
//             timer = null;
//         }, secondKeyPressTimeout);
//     }
// }