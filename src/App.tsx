import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import UploadArea from './components/UploadArea';
import ImagePreview from './components/ImagePreview';
import UpscaleOptions from './components/UpscaleOptions';
import ScanningModal from './components/ScanningModal';
import MobileTopBar from './components/MobileTopBar';
import SuccessNotification from './components/SuccessNotification';
import ErrorNotification from './components/ErrorNotification';

function AppContent() {
  const { 
    isScanningModalOpen, 
    closeScanningModal, 
    scanningImageName, 
    images, 
    successNotification, 
    setSuccessNotification, 
    apiErrorNotification, 
    setApiErrorNotification 
  } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Navigation - only visible on small screens */}
      <MobileTopBar />
      
      {/* Main Layout: Sidebar and Content Area */}
      <div className="flex h-full">
        {/* Sidebar */}
        {/* <Sidebar /> */}
        
        {/* Main Content Area */}
        <div className="w-full pt-4">
          <div className="px-4 md:px-8 max-w-7xl mx-auto">
            {/* Welcome/Title Section */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">Enhance Your Images</h1>
              <p className="text-gray-600">
                Upload an image and use our AI to upscale and enhance it with just a few clicks.
              </p>
            </div>
            
            {/* Image Upload or Preview Section */}
            {images.length === 0 ? (
              <div className="my-12 flex items-center justify-center">
                <UploadArea />
              </div>
            ) : (
              <div className="mx-auto mb-12">
                {/* Vertical stacked layout - Image Preview on top */}
                <div className="mb-8">
                  <ImagePreview />
                </div>
                
                {/* Enhancement Options below */}
                <div>
                  <UpscaleOptions />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <ScanningModal 
        isOpen={isScanningModalOpen}
        onClose={closeScanningModal}
        imageName={scanningImageName}
      />

      {/* Success Notification */}
      {successNotification && (
        <SuccessNotification 
          message={successNotification} 
          onClose={() => setSuccessNotification(null)} 
        />
      )}

      {/* Error Notification */}
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