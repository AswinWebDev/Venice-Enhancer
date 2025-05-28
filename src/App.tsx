import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImagePreview from './components/ImagePreview';
import UpscaleOptions from './components/UpscaleOptions';
import ScanningModal from './components/ScanningModal';
import SuccessNotification from './components/SuccessNotification';
import ErrorNotification from './components/ErrorNotification';
import ComparisonModal from './components/ComparisonModal';

function AppContent() {
  const { 
    isScanningModalOpen, 
    closeScanningModal, 
    scanningImageName, 
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
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          {images.length === 0 && (
            <div className="my-12 text-center">
              <h1 className="text-4xl font-bold mb-4 text-venice-deep-olive">Enhance Your Images</h1>
              <p className="text-lg text-venice-dark-olive mb-8">
                Upload an image and use our AI to upscale and enhance it with just a few clicks.
              </p>
              <UploadArea />
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
          originalImage={comparisonImages.original} 
          enhancedImage={comparisonImages.enhanced} 
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