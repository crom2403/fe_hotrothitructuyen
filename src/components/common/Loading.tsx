import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="text-center p-4">
      <Loader2 className="h-10 w-10 mx-auto mb-4 text-blue-600 animate-spin" />
    </div>

    //     <div className="flex items-center justify-center">
    //       <style>{`
    //         .loader {
    //           display: flex;
    //           align-items: center;
    //           justify-content: center;
    //           flex-direction: column;
    //           gap: 5px;
    //         }

    //         .loading-text {
    //           color: black;
    //           font-size: 14pt;
    //           font-weight: 600;
    //           margin-left: 10px;
    //         }

    //         .dot {
    //           margin-left: 3px;
    //           animation: blink 1.5s infinite;
    //         }
    //         .dot:nth-child(2) {
    //           animation-delay: 0.3s;
    //         }

    //         .dot:nth-child(3) {
    //           animation-delay: 0.6s;
    //         }

    //         .loading-bar-background {
    //           --height: 20px;
    //           display: flex;
    //           align-items: center;
    //           box-sizing: border-box;

    //           width: 200px;
    //           height: var(--height);
    //           background-color:rgb(239, 244, 244) /*change this*/;
    //           box-shadow:rgb(242, 245, 244) -2px 2px 4px 0px inset;
    //           border-radius: calc(var(--height) / 2);
    //         }

    //         .loading-bar {
    //           position: relative;
    //           display: flex;
    //           justify-content: center;
    //           flex-direction: column;
    //           --height: 20px;
    //           width: 0%;
    //           height: var(--height);
    //           overflow: hidden;
    //           background: rgb(16, 82, 153);
    //           background: linear-gradient(
    //             0deg,
    //             rgb(13, 120, 182) 0%,
    //             rgb(179, 202, 227) 100%
    //           );
    //           border-radius: calc(var(--height) / 2);
    //           animation: loading 4s ease-out infinite;
    //         }

    //         .white-bars-container {
    //           position: absolute;
    //           display: flex;
    //           align-items: center;
    //           gap: 18px;
    //         }

    //         .white-bar {
    //           background: rgb(235, 222, 222);
    //           background: linear-gradient(
    //             -45deg,
    //             rgba(255, 255, 255, 1) 0%,
    //             rgba(255, 255, 255, 0) 70%
    //           );
    //           width: 10px;
    //           height: 45px;
    //           opacity: 0.3;
    //           rotate: 45deg;
    //         }

    //         @keyframes loading {
    //           0% {
    //             width: 0;
    //           }
    //           80% {
    //             width: 100%;
    //           }
    //           100% {
    //             width: 100%;
    //           }
    //         }

    //         @keyframes blink {
    //           0%,
    //           100% {
    //             opacity: 0;
    //           }
    //           50% {
    //             opacity: 1;
    //           }
    //         }

    //       `}</style>
    // <div className="loader">
    //   <div className="loading-text">
    //     Loading<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
    //   </div>
    //   <div className="loading-bar-background">
    //     <div className="loading-bar">
    //       <div className="white-bars-container">
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //         <div className="white-bar"></div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    // </div>
  );
};

export default Loading;
