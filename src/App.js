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
import { useLocation } from "react-router-dom";
import "./App.css";

// Utility CSS for hiding scrollbars and disabling selection
const hideScrollbarStyle = {
  scrollbarWidth: "none", // Firefox
  msOverflowStyle: "none", // IE 10+
  overflow: "hidden",
  userSelect: "none", // Prevent text selection
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
};

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
  const [contentDimensions, setContentDimensions] = useState({
    width: 1480,
    height: 800,
    gridTemplate: "repeat(5, 280px)",
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [rawMarkdown, setRawMarkdown] = useState("");

  // Standard BMC layout - defined early to avoid reference errors
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

  // Calculate dynamic content-based dimensions
  const calculateContentDimensions = useCallback(() => {
    if (!bmcData) return { width: 1480, height: 800 };

    // Calculate content-based column widths
    const sections = bmcSections.map((section) => {
      const data = bmcData[section.key];
      if (!data) return { ...section, contentWidth: 250 };

      // Estimate width based on content length
      const maxLineLength = Math.max(
        data.title?.length || 0,
        ...data.content.map((item) => item.length)
      );

      // Base width + extra for longer content
      const contentWidth = Math.max(
        250,
        Math.min(400, 200 + maxLineLength * 3)
      );

      return { ...section, contentWidth };
    });

    // Calculate grid dimensions
    const col1Width = Math.max(
      sections.find((s) => s.gridArea === "partners")?.contentWidth || 250
    );
    const col2Width = Math.max(
      sections.find((s) => s.gridArea === "activities")?.contentWidth || 250,
      sections.find((s) => s.gridArea === "resources")?.contentWidth || 250
    );
    const col3Width = Math.max(
      sections.find((s) => s.gridArea === "value")?.contentWidth || 250
    );
    const col4Width = Math.max(
      sections.find((s) => s.gridArea === "relationships")?.contentWidth || 250,
      sections.find((s) => s.gridArea === "channels")?.contentWidth || 250
    );
    const col5Width = Math.max(
      sections.find((s) => s.gridArea === "segments")?.contentWidth || 250
    );

    const totalWidth =
      col1Width + col2Width + col3Width + col4Width + col5Width + 4 * 24; // 4 gaps
    const gridTemplate = `${col1Width}px ${col2Width}px ${col3Width}px ${col4Width}px ${col5Width}px`;

    return {
      width: totalWidth,
      height: 800, // Will adjust based on content height too
      gridTemplate,
      columnWidths: [col1Width, col2Width, col3Width, col4Width, col5Width],
    };
  }, [bmcData, bmcSections]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
          setRawMarkdown(content);
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

  // --- Mouse and touch handlers for PAN mode ---
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return; // Only left click
      setIsDragging(true);
      setDragStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      });
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

  // --- Touch handlers for mobile pan ---
  const touchState = useRef({ x: 0, y: 0, dragging: false });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchState.current.dragging = true;
      touchState.current.x = e.touches[0].clientX - transform.x;
      touchState.current.y = e.touches[0].clientY - transform.y;
    }
  };
  const handleTouchMove = (e) => {
    if (touchState.current.dragging && e.touches.length === 1) {
      setTransform((prev) => ({
        ...prev,
        x: e.touches[0].clientX - touchState.current.x,
        y: e.touches[0].clientY - touchState.current.y,
      }));
    }
  };
  const handleTouchEnd = () => {
    touchState.current.dragging = false;
  };

  // --- Zoom sensitivity reduced ---
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    // Reduce zoom factor for smoother experience
    const ZOOM_FACTOR = 0.03; // Lower = less sensitive
    const delta = e.deltaY * ZOOM_FACTOR;
    const scaleMultiplier = 1 - delta;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setTransform((prev) => {
      let newScale = prev.scale * scaleMultiplier;
      newScale = Math.max(0.2, Math.min(2, newScale));
      const scaleChange = newScale / prev.scale;
      return {
        x: mouseX - (mouseX - prev.x) * scaleChange,
        y: mouseY - (mouseY - prev.y) * scaleChange,
        scale: newScale,
      };
    });
  }, []);

  // --- Zoom in/out buttons: less aggressive ---
  const zoomIn = () => {
    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTransform((prev) => {
      const newScale = Math.min(2, prev.scale * 1.07); // smaller step
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
      const newScale = Math.max(0.2, prev.scale / 1.07); // smaller step
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
    const bmcContent = bmcContentRef.current;
    if (!container || !bmcContent) return;

    // Get visible area of the canvas
    const containerRect = container.getBoundingClientRect();
    // Get actual BMC content size
    const bmcRect = bmcContent.getBoundingClientRect();

    // Remove any scrollbars from calculation
    const padding = 40;
    const availableWidth = containerRect.width - padding * 2;
    const availableHeight = containerRect.height - padding * 2;

    // Use actual content size for scaling
    const scaleX = availableWidth / bmcRect.width;
    const scaleY = availableHeight / bmcRect.height;
    const scale = Math.min(scaleX, scaleY, 1);

    // Center the BMC content
    const x = (containerRect.width - bmcRect.width * scale) / 2;
    const y = (containerRect.height - bmcRect.height * scale) / 2;

    setTransform({
      x: x,
      y: y,
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
    // Touch events
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  // --- Load BMC from URL param on mount ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("data");
    if (dataParam) {
      try {
        const decoded = base64DecodeUnicode(decodeURIComponent(dataParam));
        let fileObj;
        try {
          fileObj = JSON.parse(decoded);
        } catch {
          // fallback for old links: treat as plain markdown
          fileObj = { filename: "Shared BMC", content: decoded };
        }
        setRawMarkdown(fileObj.content);
        const { sections: parsedData, title } = parseMarkdownToBMC(
          fileObj.content
        );
        setBmcData(parsedData);
        setBmcTitle(title);
        setFileName(fileObj.filename || "Shared BMC");
        setTransform({ x: 50, y: 50, scale: 0.8 });
      } catch (e) {
        // ignore if invalid
      }
    }
  }, [parseMarkdownToBMC]);

  // --- Share button handler ---
  const handleShare = () => {
    let markdown = rawMarkdown;
    let filename = fileName || "Shared BMC";
    if (!markdown && bmcData) {
      // Try to reconstruct markdown from bmcData
      markdown = Object.values(bmcData)
        .map(
          (section) =>
            `## ${section.title}\n` +
            section.content.map((item) => `- ${item}`).join("\n")
        )
        .join("\n\n");
    }
    if (!markdown) return;
    const payload = { filename, content: markdown };
    const encoded = encodeURIComponent(
      base64EncodeUnicode(JSON.stringify(payload))
    );
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    setShareLink(url);
    navigator.clipboard.writeText(url);
    alert("Sharable link copied to clipboard!");
  };

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
      style={hideScrollbarStyle}
    >
      {/* Header */}
      <div
        className={`$${
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

          <button
            onClick={handleShare}
            className={`flex items-center space-x-2 ${
              isDarkMode
                ? "bg-blue-700 hover:bg-blue-600"
                : "bg-blue-600 hover:bg-blue-700"
            } px-4 py-2 rounded-lg transition-colors text-white font-medium`}
            disabled={!bmcData && !rawMarkdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 30 30"
            >
              <path
                d="M 23 3 A 4 4 0 0 0 19 7 A 4 4 0 0 0 19.09375 7.8359375 L 10.011719 12.376953 A 4 4 0 0 0 7 11 A 4 4 0 0 0 3 15 A 4 4 0 0 0 7 19 A 4 4 0 0 0 10.013672 17.625 L 19.089844 22.164062 A 4 4 0 0 0 19 23 A 4 4 0 0 0 23 27 A 4 4 0 0 0 27 23 A 4 4 0 0 0 23 19 A 4 4 0 0 0 19.986328 20.375 L 10.910156 15.835938 A 4 4 0 0 0 11 15 A 4 4 0 0 0 10.90625 14.166016 L 19.988281 9.625 A 4 4 0 0 0 23 11 A 4 4 0 0 0 27 7 A 4 4 0 0 0 23 3 z"
                fill={isDarkMode ? "#ffffff" : "#ffffff"}
              ></path>
            </svg>
            <span>Share</span>
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
      <div className="flex-1 relative" style={hideScrollbarStyle}>
        <div
          ref={canvasRef}
          className={`w-full h-full bmc-canvas-area ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ minWidth: "100%", minHeight: "100%", ...hideScrollbarStyle }}
          onMouseDown={handleMouseDown}
        >
          {bmcData ? (
            <div
              className="relative origin-top-left transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                width: "max-content",
                height: "max-content",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              <div
                ref={bmcContentRef}
                className={`$${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-300"
                } rounded-xl border-2 shadow-xl overflow-hidden`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  userSelect: "none",
                }}
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
                      gridTemplateColumns: contentDimensions.gridTemplate,
                      gridTemplateRows: "auto auto auto",
                      gridTemplateAreas: `
                        "partners activities value relationships segments"
                        "partners resources value channels segments" 
                        "costs costs revenue revenue revenue"
                      `,
                      width: contentDimensions.width + "px",
                      height: "auto",
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

// --- Unicode-safe base64 encode/decode ---
function base64EncodeUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode("0x" + p1);
    })
  );
}
function base64DecodeUnicode(str) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function App() {
  return <DynamicBMCCanvas />;
}

export default App;
