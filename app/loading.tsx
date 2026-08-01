import LottieLoader from "@/components/ui/lottie-loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
    <div className="h-[130px] w-[130px] sm:h-[180px] sm:w-[180px]">
        <LottieLoader
        fullScreen={false}
        size={240}
        />
    </div>
    </div>
  );
}