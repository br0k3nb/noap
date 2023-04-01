import error404 from '../assets/error404.png';
import { motion } from 'framer-motion';

export default function Page404() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 h-screen overflow md:py-20 md:px-14 lg:px-0 md:pt-10 items-center flex justify-center flex-col md:gap-28 gap-16"
    >
      <div className="w-full lg:w-9/12 xxs:px-10 sm:px-16 relative text-start lg:px-0">
        <div className="flex flex-wrap">
          <img
            src={error404}
            className='w-full max-h-[800px] pb-5 h-[80%] xxs:h-[60%] xxs:pt-0 md:h-[70%] md:mt-10 xl:max-h-[590px] xl:mt-10 xl:max-w-[900px] pt-10 lg:h-[550px] mx-auto object-cover'
          />
        </div>
        <div className="px-0 xl:px-24">
          <h1 className=" text-gray-100 font-bold text-3xl xxs:text-xl md:mt-10">
            Oops, Looks like you've found the
            doorway to the great <span className="text-red-600">nothing</span>
          </h1>
          <p className="text-lg xxs:text-sm mt-2 mb-10 text-gray-100">
            Sorry about that! Please visit our hompage to get where you need to go.
          </p>
          <div className="flex text-md tracking-widest uppercase xl:justify-center">
            <a
              href="/home"
              className="sm:w-full xxs:w-full lg:w-auto border border-gray-500 rounded-[30px] py-4 sm:py-3 xxs:py-2 px-6 text-center bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0 hover:scale-105 transition duration-200"
            >
              Go back
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}