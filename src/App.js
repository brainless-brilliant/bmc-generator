import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Upload,
  FileText,
  Download,
  Printer,
  Moon,
  Sun,
} from "lucide-react";
import "./App.css";

const DynamicBMCCanvas = () => {
  const canvasRef = useRef(null);
  const bmcContentRef = useRef(null);
  const fileInputRef = useRef(null);
  const [transform, setTransform] = useState({ x: 50, y: 50, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bmcData, setBmcData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [bmcTitle, setBmcTitle] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Template BMC content
  const templateContent = `# Your Company Name - Business Model Canvas

## 1. Customer Segments
- Target market segment 1 (e.g., Small businesses with 10-50 employees)
- Target market segment 2 (e.g., Enterprise clients in healthcare)
- Specific demographics and psychographics

## 2. Value Propositions
- Core value proposition (e.g., Reduce operational costs by 40%)
- Unique selling points and benefits
- Problem-solution fit description

## 3. Channels
- Sales channels (e.g., Direct sales, Online platform)
- Marketing channels (e.g., Social media, Content marketing)
- Distribution methods

## 4. Customer Relationships
- Relationship type (e.g., Personal assistance, Self-service)
- Customer acquisition strategy
- Retention and loyalty programs

## 5. Revenue Streams
- Primary revenue model (e.g., Subscription-based SaaS)
- Secondary revenue sources (e.g., Professional services)
- Pricing strategy

## 6. Key Activities
- Core business activities (e.g., Software development)
- Critical operational processes
- Value chain activities

## 7. Key Resources
- Essential assets (e.g., Proprietary technology, Brand)
- Human resources and expertise
- Financial and physical resources

## 8. Key Partnerships
- Strategic partners (e.g., Technology vendors)
- Supplier relationships
- Channel partners and alliances

## 9. Cost Structure
- Major cost categories (e.g., Personnel, Infrastructure)
- Fixed vs variable costs
- Cost optimization strategies`;

  // Download template function
  const downloadTemplate = useCallback(() => {
    const blob = new Blob([templateContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BMC-Template.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  // Standard BMC layout with fixed structure but flexible content
  const bmcSections = [
    {
      key: "keyPartners",
      title: "Key Partners",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "partners",
    },
    {
      key: "keyActivities",
      title: "Key Activities",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "activities",
    },
    {
      key: "valuePropositions",
      title: "Value Propositions",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "value",
    },
    {
      key: "customerRelationships",
      title: "Customer Relationships",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "relationships",
    },
    {
      key: "customerSegments",
      title: "Customer Segments",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "segments",
    },
    {
      key: "keyResources",
      title: "Key Resources",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "resources",
    },
    {
      key: "channels",
      title: "Channels",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "channels",
    },
    {
      key: "costStructure",
      title: "Cost Structure",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "costs",
    },
    {
      key: "revenueStreams",
      title: "Revenue Streams",
      color: isDarkMode ? "bg-gray-700" : "bg-gray-100",
      gridArea: "revenue",
    },
  ];

  // Improved markdown parser with better section mapping
  const parseMarkdownToBMC = useCallback((content) => {
    const sections = {};
    const lines = content.split("\n");
    let currentSection = null;
    let currentContent = [];
    let title = "";

    // Extract title from first line
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.startsWith("#")) {
      title = firstLine.replace(/^#+\s*/, "").trim();
    }

    // Enhanced section mappings with multiple variations
    const sectionMappings = {
      // Customer Segments variations
      "customer segments": "customerSegments",
      customersegments: "customerSegments",
      "target customers": "customerSegments",
      "target market": "customerSegments",
      "market segments": "customerSegments",

      // Value Propositions variations
      "value propositions": "valuePropositions",
      valuepropositions: "valuePropositions",
      "value proposition": "valuePropositions",
      "unique value": "valuePropositions",
      benefits: "valuePropositions",

      // Channels variations
      channels: "channels",
      "distribution channels": "channels",
      "sales channels": "channels",
      "marketing channels": "channels",
      "reach customers": "channels",

      // Customer Relationships variations
      "customer relationships": "customerRelationships",
      customerrelationships: "customerRelationships",
      "customer relations": "customerRelationships",
      "relationship types": "customerRelationships",
      "customer interaction": "customerRelationships",

      // Revenue Streams variations
      "revenue streams": "revenueStreams",
      revenuestreams: "revenueStreams",
      "revenue sources": "revenueStreams",
      "income streams": "revenueStreams",
      monetization: "revenueStreams",
      pricing: "revenueStreams",

      // Key Activities variations
      "key activities": "keyActivities",
      keyactivities: "keyActivities",
      "core activities": "keyActivities",
      "main activities": "keyActivities",
      "business activities": "keyActivities",

      // Key Resources variations
      "key resources": "keyResources",
      keyresources: "keyResources",
      "core resources": "keyResources",
      "main resources": "keyResources",
      "essential resources": "keyResources",
      assets: "keyResources",

      // Key Partnerships variations
      "key partnerships": "keyPartners",
      keypartnerships: "keyPartners",
      "key partners": "keyPartners",
      keypartners: "keyPartners",
      partnerships: "keyPartners",
      partners: "keyPartners",
      "strategic alliances": "keyPartners",
      alliances: "keyPartners",

      // Cost Structure variations
      "cost structure": "costStructure",
      coststructure: "costStructure",
      costs: "costStructure",
      expenses: "costStructure",
      "cost breakdown": "costStructure",
      "operating costs": "costStructure",
    };

    for (let i = 1; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) continue;

      const headerMatch = line.match(/^#+\s*(.+?)(?:\s*[🎯👥📡🤝💰🏃‍♂️🛠️💸])?$/);
      if (headerMatch) {
        // Save previous section with original title
        if (currentSection && currentContent.length > 0) {
          sections[currentSection.key] = {
            title: currentSection.originalTitle,
            content: currentContent.filter((item) => item.trim()),
          };
        }

        // Clean and normalize the section text for mapping
        const originalTitle = headerMatch[1].replace(/^\d+\.\s*/, "").trim();
        const normalizedText = originalTitle
          .toLowerCase()
          .replace(/[^\w\s]/g, "") // Remove special characters
          .replace(/\s+/g, " ") // Normalize spaces
          .trim();

        // Try exact match first, then try without spaces
        let mappedKey =
          sectionMappings[normalizedText] ||
          sectionMappings[normalizedText.replace(/\s/g, "")];

        // If no direct match, try partial matching
        if (!mappedKey) {
          for (const [key, value] of Object.entries(sectionMappings)) {
            if (normalizedText.includes(key) || key.includes(normalizedText)) {
              mappedKey = value;
              break;
            }
          }
        }

        // Fallback: use cleaned original text as key
        if (!mappedKey) {
          mappedKey = normalizedText.replace(/\s+/g, "").replace(/^\d+/, "");
        }

        currentSection = { key: mappedKey, originalTitle };
        currentContent = [];
        continue;
      }

      if (currentSection && line) {
        const cleanLine = line
          .replace(/^[•\-*]\s*/, "")
          .replace(/^\d+\.\s*/, "")
          .replace(/^\*+([^*]+)\*+:?\s*/, "$1: ")
          .trim();

        if (cleanLine) {
          currentContent.push(cleanLine);
        }
      }
    }

    // Save last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection.key] = {
        title: currentSection.originalTitle,
        content: currentContent.filter((item) => item.trim()),
      };
    }

    console.log(
      "Parsed sections with titles:",
      Object.keys(sections).map((key) => ({ key, title: sections[key].title }))
    );

    return { sections, title };
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (
        file &&
        (file.type === "text/markdown" || file.name.endsWith(".md"))
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const { sections: parsedData, title } = parseMarkdownToBMC(content);
          setBmcData(parsedData);
          setBmcTitle(title);
          setFileName(file.name);
          setTransform({ x: 50, y: 50, scale: 0.8 });
        };
        reader.readAsText(file);
      }
    },
    [parseMarkdownToBMC]
  );

  // Print BMC function
  const printBMC = useCallback(() => {
    if (!bmcContentRef.current) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    const bmcContent = bmcContentRef.current.outerHTML;

    // Get Montserrat font and styles
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${bmcTitle || "Business Model Canvas"}</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Montserrat', sans-serif;
              background: white;
              padding: 0;
              margin: 0;
            }
            .print-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .bmc-content {
              transform: scale(1) !important;
              transform-origin: center center;
              max-width: 100%;
              max-height: 100%;
            }
            @media print {
              .print-container {
                width: 100%;
                height: 100%;
                padding: 0;
              }
              .bmc-content {
                page-break-inside: avoid;
                transform: scale(0.8) !important;
              }
            }
            /* Copy Tailwind classes for print */
            .bg-white { background-color: white; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-700 { background-color: #374151; }
            .bg-gray-800 { background-color: #1f2937; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-600 { border-color: #4b5563; }
            .text-gray-100 { color: #f3f4f6; }
            .text-gray-200 { color: #e5e7eb; }
            .text-gray-300 { color: #d1d5db; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .rounded-xl { border-radius: 0.75rem; }
            .border-2 { border-width: 2px; }
            .shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04); }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05); }
            .overflow-hidden { overflow: hidden; }
            .text-center { text-align: center; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .font-bold { font-weight: 700; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.025em; }
            .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
            .p-8 { padding: 2rem; }
            .p-4 { padding: 1rem; }
            .p-5 { padding: 1.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-b { border-bottom-width: 1px; }
            .border-l-4 { border-left-width: 4px; }
            .pl-4 { padding-left: 1rem; }
            .mt-2 { margin-top: 0.5rem; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            .items-start { align-items: flex-start; }
            .space-x-3 > * + * { margin-left: 0.75rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .leading-relaxed { line-height: 1.625; }
            .min-h-0 { min-height: 0px; }
            .w-2 { width: 0.5rem; }
            .h-2 { height: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            .flex-shrink-0 { flex-shrink: 0; }
            .grid { display: grid; }
            .gap-6 { gap: 1.5rem; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="bmc-content">
              ${bmcContent}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }, [bmcTitle]);

  // Canvas interaction handlers
  const handleMouseDown = useCallback(
    (e) => {
      if (
        e.target === canvasRef.current ||
        e.target.closest(".bmc-canvas-area")
      ) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - transform.x,
          y: e.clientY - transform.y,
        });
      }
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        }));
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform((prev) => {
      const newScale = Math.max(0.2, Math.min(2, prev.scale * delta));
      const scaleChange = newScale / prev.scale;

      return {
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange,
        scale: newScale,
      };
    });
  }, []);

  // Control functions
  const zoomIn = () => {
    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTransform((prev) => {
      const newScale = Math.min(2, prev.scale * 1.15);
      const scaleChange = newScale / prev.scale;

      return {
        x: centerX - (centerX - prev.x) * scaleChange,
        y: centerY - (centerY - prev.y) * scaleChange,
        scale: newScale,
      };
    });
  };

  const zoomOut = () => {
    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setTransform((prev) => {
      const newScale = Math.max(0.2, prev.scale / 1.15);
      const scaleChange = newScale / prev.scale;

      return {
        x: centerX - (centerX - prev.x) * scaleChange,
        y: centerY - (centerY - prev.y) * scaleChange,
        scale: newScale,
      };
    });
  };

  const fitToView = () => {
    const container = canvasRef.current;
    const bmcElement = bmcContentRef.current;
    if (!container || !bmcElement) return;

    const containerRect = container.getBoundingClientRect();
    const bmcRect = bmcElement.getBoundingClientRect();
    const padding = 60; // Increased padding

    const scaleX = (containerRect.width - padding * 2) / 1600; // Fixed BMC width
    const scaleY = (containerRect.height - padding * 2) / 1000; // Fixed BMC height
    const scale = Math.min(scaleX, scaleY, 0.9); // Max scale of 0.9

    setTransform({
      x: (containerRect.width - 1600 * scale) / 2,
      y: (containerRect.height - 1000 * scale) / 2,
      scale,
    });
  };

  const resetView = () => {
    setTransform({ x: 50, y: 50, scale: 0.8 });
  };

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  // Render BMC section
  const renderBMCSection = (section) => {
    const data = bmcData[section.key];
    if (!data) return null;

    return (
      <div
        key={section.key}
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-300"
        } rounded-xl border-2 overflow-hidden flex flex-col min-h-0 shadow-lg`}
        style={{ gridArea: section.gridArea }}
      >
        <div
          className={`${section.color} ${
            isDarkMode ? "border-gray-600" : "border-gray-300"
          } border-b-2 p-4`}
        >
          <h3
            className={`font-bold text-base ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            } text-center uppercase tracking-wide`}
          >
            {data.title || section.title}
          </h3>
        </div>
        <div className="p-5 overflow-visible flex-1">
          <div className="space-y-4">
            {data.content.map((item, index) => (
              <div key={index} className="text-sm leading-relaxed break-words">
                {item.includes(":") ? (
                  <div className="space-y-2">
                    <div
                      className={`font-bold ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      } text-sm break-words`}
                    >
                      {item.split(":")[0]}:
                    </div>
                    <div
                      className={`${
                        isDarkMode
                          ? "text-gray-300 border-gray-600"
                          : "text-gray-700 border-gray-300"
                      } pl-4 border-l-3 border-l-4 break-words`}
                    >
                      {item.split(":").slice(1).join(":").trim()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 ${
                        isDarkMode ? "bg-gray-400" : "bg-gray-500"
                      } rounded-full mt-2 flex-shrink-0`}
                    ></div>
                    <div
                      className={`${
                        isDarkMode ? "text-gray-300" : "text-gray-800"
                      } flex-1 leading-relaxed break-words`}
                    >
                      {item}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-screen flex flex-col ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } shadow-sm border-b px-6 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          <h1
            className={`text-2xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Business Model Canvas
          </h1>
          {fileName && (
            <div
              className={`flex items-center space-x-2 ${
                isDarkMode
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-50 text-blue-700"
              } px-3 py-1 rounded-lg`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{fileName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className={`flex items-center space-x-2 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } px-3 py-2 rounded-lg transition-colors`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isDarkMode ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={downloadTemplate}
            className={`flex items-center space-x-2 ${
              isDarkMode
                ? "bg-green-800 hover:bg-green-700 text-green-200"
                : "bg-green-600 hover:bg-green-700 text-white"
            } px-4 py-2 rounded-lg transition-colors font-medium`}
          >
            <Download className="w-4 h-4" />
            <span>Download Template</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center space-x-2 ${
              isDarkMode
                ? "bg-blue-700 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-4 py-2 rounded-lg transition-colors font-medium`}
          >
            <Upload className="w-4 h-4" />
            <span>Select BMC File</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b px-6 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={zoomIn}
            className={`flex items-center space-x-1 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } px-3 py-2 rounded-lg transition-colors`}
          >
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm font-medium">Zoom In</span>
          </button>

          <button
            onClick={zoomOut}
            className={`flex items-center space-x-1 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } px-3 py-2 rounded-lg transition-colors`}
          >
            <ZoomOut className="w-4 h-4" />
            <span className="text-sm font-medium">Zoom Out</span>
          </button>

          <button
            onClick={fitToView}
            className={`flex items-center space-x-1 ${
              isDarkMode
                ? "bg-emerald-800 hover:bg-emerald-700 text-emerald-200"
                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
            } px-3 py-2 rounded-lg transition-colors`}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">Fit to Screen</span>
          </button>

          <button
            onClick={resetView}
            className={`flex items-center space-x-1 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } px-3 py-2 rounded-lg transition-colors`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Reset</span>
          </button>

          {false && bmcData && (
            <button
              onClick={printBMC}
              className={`flex items-center space-x-1 ${
                isDarkMode
                  ? "bg-purple-800 hover:bg-purple-700 text-purple-200"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-700"
              } px-3 py-2 rounded-lg transition-colors`}
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">Print BMC</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Drag to pan • Scroll to zoom • Use "Fit to Screen" to center
            optimally
          </div>
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            } font-medium`}
          >
            Zoom: {Math.round(transform.scale * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing bmc-canvas-area"
          onMouseDown={handleMouseDown}
        >
          {bmcData ? (
            <div
              className="relative origin-top-left transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              }}
            >
              <div
                ref={bmcContentRef}
                className={`${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-300"
                } rounded-xl border-2 shadow-xl overflow-hidden`}
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {/* BMC Title Header */}
                <div
                  className={`text-center py-8 border-b-2 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <h1
                    className={`text-3xl font-bold ${
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    } mb-2`}
                  >
                    {bmcTitle || "Business Model Canvas"}
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Strategic Business Planning Framework
                  </p>
                </div>

                {/* BMC Content Container */}
                <div className="p-8">
                  {/* BMC Grid */}
                  <div
                    className="grid gap-6"
                    style={{
                      gridTemplateColumns: "repeat(5, minmax(250px, 1fr))",
                      gridTemplateRows: "auto auto auto",
                      gridTemplateAreas: `
                        "partners activities value relationships segments"
                        "partners resources value channels segments" 
                        "costs costs revenue revenue revenue"
                      `,
                      width: "100%",
                      minWidth: "1500px",
                      maxWidth: "1800px",
                    }}
                  >
                    {bmcSections.map(renderBMCSection)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div
                  className={`w-24 h-24 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <FileText
                    className={`w-12 h-12 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  } mb-3`}
                >
                  No BMC File Loaded
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mb-6 max-w-md`}
                >
                  Select a markdown file to generate your Business Model Canvas
                  visualization
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`${
                    isDarkMode
                      ? "bg-blue-700 hover:bg-blue-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-6 py-3 rounded-lg transition-colors font-medium`}
                >
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-t px-6 py-3 flex items-center justify-between`}
      >
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          🔒 Your files never leave your browser - completely private and secure
        </div>
        <div
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Made with ❤️ for pitchers
        </div>
      </div>
    </div>
  );
};

function App() {
  return <DynamicBMCCanvas />;
}

export default App;
