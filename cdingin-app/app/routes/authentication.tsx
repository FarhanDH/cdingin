import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import axios, { AxiosError } from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import EmailStep from '~/authentication/email-step';
import NameStep from '~/authentication/name-step';
import OtpStep from '~/authentication/otp-step';
import PhoneStep from '~/authentication/phone-step';
import type { AuthUser } from '~/types/auth.type';
import Spinner from '~/components/ui/spinner';

export default function Authentication() {
  const [step, setStep] = useState<'email' | 'otp' | 'name' | 'phone'>('email');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Email
  const handleEmailSubmit = async (data: { email: string }) => {
    try {
      setLoading(true);
      // Call /email/send-otp API
      await axios.post(
        `${import.meta.env.VITE_API_URL}/email/send-otp`,
        {
          email: data.email,
        },
        {
          withCredentials: true,
        },
      );
      // If success, go to OTP step
      setUser({
        user: {
          email: data.email,
        },
      });
      setStep('otp');
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ??
            'Yah, kayaknya ada yang salah. Coba lagi nanti, ya',
        );
        throw new Error(error.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP
  const handleOtpSubmit = async (data: { otp: string }) => {
    try {
      // Response: { isNewUser, user }
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          email: user?.user.email,
          otp: data.otp,
        },
      );
      // If not new, go to order page
      // If new, go to name step

      if (response.data.data?.isNewUser) {
        setUser({
          ...user,
          user: { email: user?.user.email ?? '' },
          isNewUser: true,
        });
        setStep('name');
      } else {
        setUser({ user: response.data.data.user, isNewUser: false });
        // Navigate to orders page
        navigate('/orders');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ??
            'Yah, kayaknya ada yang salah. Coba lagi nanti, ya',
        );
        // Vibrate the device
        if (navigator.vibrate) {
          navigator.vibrate([200]);
        }
        throw new Error(error.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/email/send-otp`, {
        email: user?.user.email,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ??
            'Yah, kayaknya ada yang salah. Coba lagi nanti, ya',
        );
        throw new Error(error.response?.data.message);
      }
    }
  };

  // Step 3: Name (only for new users)
  const handleNameSubmit = async (data: { name: string }) => {
    setUser({
      ...user,
      user: { email: user?.user.email ?? '', fullName: data.name },
    });
    setStep('phone');
  };

  // Step 4: Phone
  const handlePhoneSubmit = async (data: { phone: string }) => {
    try {
      // Call /auth/register-customer-profile API
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register-customer-profile`,
        {
          email: user?.user.email,
          fullName: user?.user.fullName,
          phoneNumber: data.phone,
        },
      );

      setUser({ ...response.data });
      // Navigate to orders page
      navigate('/orders');
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ??
            'Yah, kayaknya ada yang salah. Coba lagi nanti, ya',
        );
        throw new Error(error.response?.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div
          className={`flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50 ${
            loading ? 'bg-black/50' : ''
          }`}
        >
          <Dialog open={loading} modal>
            <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
              <Spinner size={30} />
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className={`flex-1 px-4 pt-4`}>
        <button
          onClick={() => (step === 'email' ? navigate('/') : setStep('email'))}
          className="inline-block mb-8 cursor-pointer w-8 h-8"
        >
          <ArrowLeft size={24} className="text-[#222222]" />
        </button>
        {step === 'email' && (
          <EmailStep
            onSubmit={handleEmailSubmit}
            error={error}
            loading={loading}
          />
        )}
        {step === 'otp' && (
          <OtpStep
            onSubmit={handleOtpSubmit}
            onResend={handleResendOtp}
            email={user?.user.email}
            error={error}
            onClearError={() => setError('')}
            loading={loading}
          />
        )}
        {step === 'name' && (
          <NameStep
            onSubmit={handleNameSubmit}
            error={error}
            loading={loading}
          />
        )}
        {step === 'phone' && (
          <PhoneStep onSubmit={handlePhoneSubmit} loading={loading} />
        )}
      </div>
    </>
  );
}
