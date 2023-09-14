import { useEffect } from 'react'
import anime from 'animejs/lib/anime.es.js';

type Props = {
    weight?: string | number;
    height?: string | number;
    loop?: boolean;
    endDelay?: number;
}

export default function SuccessCheck({ weight, height, loop, endDelay }: Props) {
    useEffect(() => {
        const tl = anime.timeline({
            easing: 'easeInOutQuint',
            endDelay: !endDelay ? 10000 : endDelay,
            autoplay: true,
            loop
        });
        
        tl
        .add({
            targets: '.success',
            scale:[0.001, 1],
            rotate:[100,360],
            opacity: [0.001, 1],
            duration: 1000
        })

        .add({
            targets: '.checkmark',
            duration: 500,
            easing: 'easeInOutSine',
            strokeDashoffset: [anime.setDashoffset, 0],
        }, 200)
        
        .add({
            targets: '.line1',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.000, 1],
            duration: 1000
        
        }, 400)
        
        .add({
            targets: '.line2',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 300)
        
        .add({
            targets: '.line3',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 400)
        
        .add({
            targets: '.line4',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 400)
        
        .add({
            targets: '.line5',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 300)
        
        .add({
            targets: '.line6',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 400)
        
        .add({
            targets: '.line7',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        
        }, 300)
        
        .add({
            targets: '.line8',
            transformOrigin: ['50% 50% 0px', '50% 50% 0px'],
            opacity: { value:[0, 1], delay:50 },
            scale:[0.001, 1],
            duration: 1000
        }, 400)
        
        .add({
            targets: ['.line1','.line2','.line3','.line4','.line5','.line6','.line7','.line8'],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInSine',
        }, '-=300')
        
        .add({
            targets: ['.success'],
            opacity: [1, 0],
            delay: 200,
            duration: 300,
            easing: 'easeInSine',
            endDelay: 500
        }, '-=300')
    }, []);

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="success" 
            width={`200 ${weight && weight}`} 
            height={`200 ${height && height}`} 
            viewBox="0 0 101 101" 
            fill="none"
        >
            <ellipse 
                cx="50.5171"
                cy="49.9367" 
                rx="11.5213" 
                ry="11.5497" 
                fill="#00AC3E"
            />
            <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                className="checkmark" 
                d="M45.2576 48.604L49.084 52.6483L55.1814 46.1154" 
                stroke="white" 
                strokeWidth="2.5"
            />
            <line  
                className="line1" 
                x1="61.8656" 
                y1="13.4946" 
                x2="58.3004" 
                y2="26.8" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line2"
                x1="84.906" 
                y1="32.622" 
                x2="72.9767" 
                y2="39.5094" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line3" 
                x1="87.6729" 
                y1="62.4366" 
                x2="74.3675" 
                y2="58.8715" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line4" 
                x1="68.5467" 
                y1="85.4764" 
                x2="61.6593" 
                y2="73.5471" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line5" 
                x1="45.1935" 
                y1="75.715" 
                x2="41.6283" 
                y2="89.0205" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line6" 
                x1="29.1204" 
                y1="64.8283" 
                x2="17.1911" 
                y2="71.7157" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line  
                className="line7" 
                x1="25.4527" 
                y1="45.765" 
                x2="12.1473" 
                y2="42.1998" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
            <line 
                className="line8" 
                x1="36.3394" 
                y1="29.6917" 
                x2="29.452" 
                y2="17.7624" 
                stroke="#00AC3E" 
                strokeWidth="3" 
                strokeLinecap="round"
            />
        </svg>
    )
}