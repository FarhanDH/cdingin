import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import acHeroImage from '../assets/home-page.png';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col p-3 mx-auto">
      {/* Logo/Brand section */}
      <div className="mb-18 md:mb-3 flex space-x-1 items-center">
        <img src="/icon-192x192.png" alt="Logo" className="w-8" />
        <h1 className="text-2xl font-bold">cdingin</h1>
      </div>

      {/* Hero image section */}
      {/* The hero image is an image that takes up the full width of the page */}
      {/* It's an image of an air conditioner */}
      <div className="text-center mb-28 md:mb-23 mx-auto p-5 md:px-11">
        <img src={acHeroImage} alt="AC Service" className="w-full mb-6" />
        <h2 className="text-2xl font-bold mb-2">Selamat datang di cdingin!</h2>
        <p className="text-gray-600 text-md md:-mb-7 mb-10">
          Cukup AC aja yang dingin, kamu jangan. Servis AC jadi gampang tinggal
          ngeklik doang..
        </p>
      </div>

      {/* Navigation buttons section */}
      {/* Both buttons have an onClick event handler that navigates to the "/auth" route */}
      <div className="w-full space-y-5">
        {/* Login button */}
        <Button
          onClick={() => navigate('/auth')}
          variant={'default'}
          className="w-full block h-[48px] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95"
        >
          Masuk
        </Button>
        {/* Registration button */}
        <Button
          onClick={() => navigate('/auth')}
          variant={'outline'}
          className="w-full h-[48px] bg-white border-[1.5px] border-[#006C7F] text-[#006C7F] rounded-full text-center text-md font-semibold cursor-pointer active:scale-95"
        >
          Belum ada akun? Daftar dulu
        </Button>
      </div>
    </div>
  );
}
