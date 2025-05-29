import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImagePreview from './components/ImagePreview';
import UpscaleOptions from './components/UpscaleOptions';
import SuccessNotification from './components/SuccessNotification.tsx';
import ErrorNotification from './components/ErrorNotification';
import ComparisonModal from './components/ComparisonModal.tsx';

function AppContent() {
  const { 
    images, 
    successNotification, 
    setSuccessNotification, 
    apiErrorNotification, 
    setApiErrorNotification,
    isComparisonModalOpen,
    closeComparisonModal,
    comparisonImages
  } = useApp();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow w-full pt-4 pb-8">
        <div className="px-4 md:px-8 max-w-7xl xl:max-w-screen-2xl mx-auto">
          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 py-12 sm:py-16 md:py-20">
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-venice-deep-olive leading-tight"
                style={{ fontFamily: "'Mea Culpa', cursive", letterSpacing: '0.05em' }} // Applying Mea Culpa if desired, adjust as needed
              >
               <span className="text-venice-bright-red">Venice</span> <span className="text-venice-deep-olive">Enhancer</span> 
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-venice-dark-olive mb-10 max-w-2xl">
              Experience the next level of image fidelity. Our advanced AI meticulously enhances and upscales, revealing crisp details and vibrant clarity in every picture.
              </p>
              <div className="w-full max-w-lg">
                <UploadArea />
              </div>
              <p className="mt-10 text-sm text-venice-olive-brown">
                Experience the art of AI-powered image perfection.
              </p>
            </div>
          )}
            
          {images.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="w-full">
                <h2 className="text-2xl font-semibold mb-4 text-venice-olive-brown">Your Image</h2>
                <ImagePreview />
              </div>
              
              <div className="w-full">
                <h2 className="text-2xl font-semibold mb-4 text-venice-olive-brown">Enhancement Options</h2>
                <UpscaleOptions />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* <ScanningModal 
        isOpen={isScanningModalOpen}
        onClose={closeScanningModal}
        imageName={scanningImageName}
      /> */}

      {isComparisonModalOpen && comparisonImages && (
        <ComparisonModal 
          isOpen={isComparisonModalOpen} 
          onClose={closeComparisonModal} 
        />
      )}

      {successNotification && (
        <SuccessNotification 
          message={successNotification} 
          onClose={() => setSuccessNotification(null)} 
        />
      )}

      {apiErrorNotification && (
        <ErrorNotification 
          message={apiErrorNotification} 
          onClose={() => setApiErrorNotification(null)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;