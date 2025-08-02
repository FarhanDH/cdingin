import { useNavigate } from 'react-router';
import Header from '~/components/header';
import { Button } from '~/components/ui/button';
import notFoundImage from '~/assets/not-found.png';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header title="404 - Not Found" showSidebar={true} isSticky={true} />
      <div className="flex flex-col text-center items-center mt-25 md:mt-20 p-3">
        <img src={notFoundImage} alt="Logo" className="w-50 mb-4"></img>
        <h1 className="text-2xl font-bold">Yah, tujuanmu nggak ketemu!</h1>
        <p className="mt-4 text-gray-500">
          Sepertinya kamu salah alamat. Yuk kembali sebelum tersesat!
        </p>
        <Button
          className="mt-8 px-9 py-5 cursor-pointer active:scale-95"
          onClick={() => navigate('/orders')}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
};
export default NotFoundPage;
