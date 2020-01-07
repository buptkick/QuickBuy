let self = this;

function timer(time) {
    if (time <= 0) {
        self.postMessage(-1);
        return self.close();
    }
    else if (time < 1000) {
        self.postMessage(time);
//        setTimeout(() => {
//            timer(time - 10);
//        }, 10)
        setTimeout(timer, time, 0);
    } 
    else {
        self.postMessage(time);
//        setTimeout(() => {
//            timer(time - 1000);
//        }, 1000)
        setTimeout(timer, 1000, time - 1000);
    }
}

self.onmessage = function (event) {
    if (!event.data) return 0;
    let timing = event.data;
    console.log('get timing:', event.data, 'ms');
//    timer(timing);
//    let ntime = new Date();
//    let timeout = timing - ntime;
//    console.log('get timeout:', timeout, 'ms');
//    timer(timeout);
    console.log('calc timeout:', timing - (new Date()), 'ms');
    timer(timing - (new Date()));
};
