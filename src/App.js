import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";
import { UltravoxSession } from "ultravox-client";
import './App.css';


pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function App() {
  const [url, setUrl] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [session, setSession] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const uvSession = new UltravoxSession();
      setSession(uvSession);
    };
    initSession();
  }, []);

  async function extractTextFromPDF(file) {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);

        try {
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = "";

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            fullText += strings.join(" ") + "\n";
          }

          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  async function onFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      setUrl(fileURL);

      try {
        const text = await extractTextFromPDF(file);
        setExtractedText(text);
        console.log("Extracted Text:", text);
      } catch (err) {
        console.error("Failed to extract text:", err);
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  }

  async function createJoinUrl() {
    const response = await fetch("http://localhost:4000/create-call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: `You are a helpful assistant. Use the following document content as context:\n\n${extractedText}`,
        model: "fixie-ai/ultravox",
        voice: "Mark",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create call: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.joinUrl || data.join_url;
  }

  async function handleStartVoice() {
    if (session) {
      try {
        const joinUrl = await createJoinUrl();
        console.log(joinUrl);
        session.joinCall(joinUrl);
        setIsSpeaking(true);
      } catch (err) {
        console.error("Error starting Ultravox session:", err);
      }
    }
  }

  async function handleStopVoice() {
    if (session) {
      try {
        await session.leaveCall();
        setIsSpeaking(false);
      } catch (err) {
        console.error("Error stopping Ultravox session:", err);
      }
    }
  }

  return (
    <div className="app-container">
      <h1 className="heading">PDF Voice Chat</h1>
  
      <div className="file-upload-row">
        <label className="file-label">
          Choose File
          <input type="file" accept="application/pdf" onChange={onFileChange} className="file-input" />
        </label>
        {/* <span className="file-name">{url && decodeURIComponent(url.split('/').pop())}</span> */}
      </div>
  
      <div className="button-row">
        <button
          className="button start-button"
          onClick={handleStartVoice}
          disabled={isSpeaking}
        >
          Start Voice Chat
        </button>
        <button
          className="button stop-button"
          onClick={handleStopVoice}
          disabled={!isSpeaking}
        >
          Stop Voice Chat
        </button>
      </div>
  
      {url && (
        <div className="iframe-wrapper">
          <iframe
            src={url}
            title="PDF Viewer"
            className="pdf-iframe"
          />
        </div>
      )}
    </div>
  );
  
}
