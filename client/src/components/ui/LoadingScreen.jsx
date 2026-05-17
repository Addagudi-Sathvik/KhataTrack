import KhataLogo from '../../assets/KhataTrack.png';

export default function LoadingScreen({ message = 'Loading KhataTrack...' }) {
  return (
    <>
      <style>{`@keyframes pulseScale {0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}} .pulse-logo{animation: pulseScale 1.8s ease-in-out infinite;}`}</style>
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <img src={KhataLogo} alt="KhataTrack" className="pulse-logo" style={{ width: 180, maxWidth: '60%', boxShadow: '0 0 30px rgba(245,158,11,0.30)' }} />
      </div>
    </>
  );
}
