# Venice Image Enhancer

## Description

Venice Image Enhancer is a powerful web application designed to upscale and enhance your images using advanced AI technology. It provides intuitive controls for fine-tuning enhancements, automatic AI-powered prompt generation to guide image replication, and a detailed history of all modifications made to each image.

## Features

*   **Multiple Image Upload:** Upload up to 5 images simultaneously (supports common image formats like JPG, PNG, WebP).
*   **AI-Powered Upscaling:** Increase image resolution with options for 2x, 4x, and 8x scaling.
*   **AI-Powered Enhancement:**
    *   Toggle image enhancement on or off.
    *   **Automatic Prompt Generation:** Leverages AI (currently Qwen-2.5-VL via Venice AI API) to analyze your image and generate a descriptive prompt that can be used to replicate or inspire similar images.
    *   **Creativity Control:** Adjust the AI's creative freedom for more imaginative or faithful enhancements.
    *   **Adherence Control:** Control how closely the enhanced image adheres to the generated prompt or original image characteristics.
*   **Per-Image Settings:** Each uploaded image maintains its own set of enhancement settings.
*   **Unified Bottom Panel:**
    *   **Thumbnail View:** Easily navigate between your uploaded images.
    *   **Compact History View:** Access a scrollable, compact history of all enhancements and upscales performed on the selected image.
*   **Image Comparison Modal:** Visually compare the original image with its enhanced/upscaled version using a dynamic diagonal split view.
*   **Auto-Download:** Enhanced and upscaled images are automatically downloaded.
*   **Responsive Design:** User interface adapts to different screen sizes.
*   **Modern UI:** Built with React, TypeScript, and Tailwind CSS for a clean and efficient user experience.

## Tech Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (Build Tool)
    *   Tailwind CSS (Styling)
    *   Lucide React (Icons)
    *   Headless UI (for accessible UI components like Switch, Tooltip - used as inspiration)
    *   UUID (for generating unique IDs)
*   **APIs:**
    *   **Venice AI API:**
        *   Image Upscaling & Enhancement: `https://api.venice.ai/api/v1/image/upscale`
        *   Prompt Generation (Chat Completions with Qwen-2.5-VL model): `https://api.venice.ai/api/v1/chat/completions`

## Getting Started

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v9.x or later) or yarn (v1.22.x or later)

### Installation

1.  **Clone the repository (if applicable) or navigate to your project directory.**
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variable:

```env
VITE_VENICE_API_KEY=your_venice_ai_api_key_here