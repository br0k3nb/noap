import logo from '../assets/logo/logo-white-no-bg.png';

export default function GlobalLoader() {
  return (
    <div className="bg-[#0f1011] h-screen w-screen absolute top-[43%] flex flex-col space-y-3 text-center items-center">
        <img src={logo} className="w-60 !mb-5 xxs:w-52 xxs:!mb-3" />    
        <span className="loading loading-spinner loading-lg text-gray-300"/>
    </div>
  )
}