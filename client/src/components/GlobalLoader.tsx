import logo from '../assets/logo/logo-white-no-bg.png';

type Props = {}

export default function GlobalLoader({}: Props) {
  return (
    <div className="bg-[#0f1011] h-screen w-screen absolute top-[43%] flex flex-col space-y-3 text-center items-center">
        <img src={logo} className="w-60 !mb-5 xxs:w-52 xxs:!mb-3" />
        <p className="animate-pulse text-xl xxs:text-lg tracking-widest uppercase font-thin text-gray-300">
            Loading user data...
        </p>
    </div>
  )
}