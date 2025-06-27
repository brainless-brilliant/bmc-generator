import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Upload,
  FileText,
  Download,
  Moon,
  Sun,
  Menu,
  X,
  Share2,
} from "lucide-react";

// Add Tailwind CSS if not already included
if (!document.querySelector('link[href*="tailwind"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";
  document.head.appendChild(link);
}

// Add Google Fonts if not already included
if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);
}

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
  const [shareLink, setShareLink] = useState("");
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [buttonsExpanded, setButtonsExpanded] = useState(true);
  const [canvasHasContent, setCanvasHasContent] = useState(false);

  // Standard BMC layout
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

  // Listen for window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth <= 768;
      setIsMobile(nowMobile);

      if (!wasMobile && nowMobile) {
        // Switching to mobile - adjust transform for mobile viewing
        setMobileMenuOpen(false);
        setTransform({ x: 20, y: 20, scale: 0.4 });
      } else if (wasMobile && !nowMobile) {
        // Switching to desktop - reset to desktop transform
        setMobileMenuOpen(false);
        setTransform({ x: 50, y: 50, scale: 0.8 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  // Toast notification system
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Simple predictable button state management
  const handleCanvasInteraction = useCallback(() => {
    if (canvasHasContent) {
      setButtonsExpanded(false); // Shrink when canvas is moved
    }
  }, [canvasHasContent]);

  const handleButtonTouch = useCallback(() => {
    setButtonsExpanded(true); // Expand when button is touched
  }, []);

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

    const sections = bmcSections.map((section) => {
      const data = bmcData[section.key];
      if (!data) return { ...section, contentWidth: 250 };

      const maxLineLength = Math.max(
        data.title?.length || 0,
        ...data.content.map((item) => item.length)
      );

      const contentWidth = Math.max(
        250,
        Math.min(400, 200 + maxLineLength * 3)
      );

      return { ...section, contentWidth };
    });

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
      col1Width + col2Width + col3Width + col4Width + col5Width + 4 * 24;
    const gridTemplate = `${col1Width}px ${col2Width}px ${col3Width}px ${col4Width}px ${col5Width}px`;

    return {
      width: totalWidth,
      height: 800,
      gridTemplate,
      columnWidths: [col1Width, col2Width, col3Width, col4Width, col5Width],
    };
  }, [bmcData, bmcSections]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Improved markdown parser
  const parseMarkdownToBMC = useCallback((content) => {
    const sections = {};
    const lines = content.split("\n");
    let currentSection = null;
    let currentContent = [];
    let title = "";

    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.startsWith("#")) {
      title = firstLine.replace(/^#+\s*/, "").trim();
    }

    const sectionMappings = {
      "customer segments": "customerSegments",
      customersegments: "customerSegments",
      "target customers": "customerSegments",
      "target market": "customerSegments",
      "market segments": "customerSegments",
      "value propositions": "valuePropositions",
      valuepropositions: "valuePropositions",
      "value proposition": "valuePropositions",
      "unique value": "valuePropositions",
      benefits: "valuePropositions",
      channels: "channels",
      "distribution channels": "channels",
      "sales channels": "channels",
      "marketing channels": "channels",
      "reach customers": "channels",
      "customer relationships": "customerRelationships",
      customerrelationships: "customerRelationships",
      "customer relations": "customerRelationships",
      "relationship types": "customerRelationships",
      "customer interaction": "customerRelationships",
      "revenue streams": "revenueStreams",
      revenuestreams: "revenueStreams",
      "revenue sources": "revenueStreams",
      "income streams": "revenueStreams",
      monetization: "revenueStreams",
      pricing: "revenueStreams",
      "key activities": "keyActivities",
      keyactivities: "keyActivities",
      "core activities": "keyActivities",
      "main activities": "keyActivities",
      "business activities": "keyActivities",
      "key resources": "keyResources",
      keyresources: "keyResources",
      "core resources": "keyResources",
      "main resources": "keyResources",
      "essential resources": "keyResources",
      assets: "keyResources",
      "key partnerships": "keyPartners",
      keypartnerships: "keyPartners",
      "key partners": "keyPartners",
      keypartners: "keyPartners",
      partnerships: "keyPartners",
      partners: "keyPartners",
      "strategic alliances": "keyPartners",
      alliances: "keyPartners",
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
        if (currentSection && currentContent.length > 0) {
          sections[currentSection.key] = {
            title: currentSection.originalTitle,
            content: currentContent.filter((item) => item.trim()),
          };
        }

        const originalTitle = headerMatch[1].replace(/^\d+\.\s*/, "").trim();
        const normalizedText = originalTitle
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

        let mappedKey =
          sectionMappings[normalizedText] ||
          sectionMappings[normalizedText.replace(/\s/g, "")];

        if (!mappedKey) {
          for (const [key, value] of Object.entries(sectionMappings)) {
            if (normalizedText.includes(key) || key.includes(normalizedText)) {
              mappedKey = value;
              break;
            }
          }
        }

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

    if (currentSection && currentContent.length > 0) {
      sections[currentSection.key] = {
        title: currentSection.originalTitle,
        content: currentContent.filter((item) => item.trim()),
      };
    }

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

          if (isMobile) {
            setTransform({ x: 20, y: 20, scale: 0.4 });
          } else {
            setTransform({ x: 50, y: 50, scale: 0.8 });
          }

          setCanvasHasContent(true);
          setButtonsExpanded(false);
          setMobileMenuOpen(false);
          showToastMessage("📄 BMC file loaded successfully!");
        };
        reader.readAsText(file);
      } else {
        showToastMessage("❌ Please select a valid .md file");
      }
    },
    [parseMarkdownToBMC, isMobile]
  );

  // Touch handlers with pinch zoom support
  const touchState = useRef({
    x: 0,
    y: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    transformAtStart: { x: 0, y: 0, scale: 1 },
    isPinching: false,
    initialDistance: 0,
    initialScale: 1,
    lastCenter: { x: 0, y: 0 },
  });

  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchState.current.dragging = true;
        touchState.current.isPinching = false;
        touchState.current.startX = touch.clientX;
        touchState.current.startY = touch.clientY;
        touchState.current.transformAtStart = { ...transform };
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        touchState.current.dragging = false;
        touchState.current.isPinching = true;
        touchState.current.initialDistance = getTouchDistance(touch1, touch2);
        touchState.current.initialScale = transform.scale;
        touchState.current.lastCenter = getTouchCenter(touch1, touch2);
        touchState.current.transformAtStart = { ...transform };
      }

      e.preventDefault();
    },
    [transform]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (
        e.touches.length === 1 &&
        touchState.current.dragging &&
        !touchState.current.isPinching
      ) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchState.current.startX;
        const deltaY = touch.clientY - touchState.current.startY;

        handleCanvasInteraction();

        setTransform({
          ...touchState.current.transformAtStart,
          x: touchState.current.transformAtStart.x + deltaX,
          y: touchState.current.transformAtStart.y + deltaY,
        });
      } else if (e.touches.length === 2 && touchState.current.isPinching) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        handleCanvasInteraction();

        const currentDistance = getTouchDistance(touch1, touch2);
        const currentCenter = getTouchCenter(touch1, touch2);

        const scaleChange =
          currentDistance / touchState.current.initialDistance;
        let newScale = touchState.current.initialScale * scaleChange;

        newScale = Math.max(0.1, Math.min(3, newScale));

        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = currentCenter.x - rect.left;
        const centerY = currentCenter.y - rect.top;

        const scaleRatio = newScale / touchState.current.transformAtStart.scale;
        const newX =
          centerX -
          (centerX - touchState.current.transformAtStart.x) * scaleRatio;
        const newY =
          centerY -
          (centerY - touchState.current.transformAtStart.y) * scaleRatio;

        setTransform({
          x: newX,
          y: newY,
          scale: newScale,
        });
      }

      e.preventDefault();
    },
    [handleCanvasInteraction]
  );

  const handleTouchEnd = useCallback(() => {
    touchState.current.dragging = false;
    touchState.current.isPinching = false;
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
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
        handleCanvasInteraction();
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        }));
      }
    },
    [isDragging, dragStart, handleCanvasInteraction]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      handleCanvasInteraction();

      const ZOOM_FACTOR = 0.03;
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
    },
    [handleCanvasInteraction]
  );

  const zoomIn = () => {
    const container = canvasRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTransform((prev) => {
      const newScale = Math.min(2, prev.scale * 1.07);
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
      const newScale = Math.max(0.2, prev.scale / 1.07);
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

    const containerRect = container.getBoundingClientRect();
    const bmcRect = bmcContent.getBoundingClientRect();

    const padding = isMobile ? 20 : 40;
    const availableWidth = containerRect.width - padding * 2;
    const availableHeight = containerRect.height - padding * 2;

    const scaleX = availableWidth / bmcRect.width;
    const scaleY = availableHeight / bmcRect.height;
    const scale = Math.min(scaleX, scaleY, 1);

    const x = (containerRect.width - bmcRect.width * scale) / 2;
    const y = (containerRect.height - bmcRect.height * scale) / 2;

    setTransform({
      x: x,
      y: y,
      scale,
    });
  };

  const resetView = () => {
    if (isMobile) {
      setTransform({ x: 20, y: 20, scale: 0.4 });
    } else {
      setTransform({ x: 50, y: 50, scale: 0.8 });
    }
  };

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
  }, [
    handleWheel,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Load BMC from URL param on mount
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
          fileObj = { filename: "Shared BMC", content: decoded };
        }
        setRawMarkdown(fileObj.content);
        const { sections: parsedData, title } = parseMarkdownToBMC(
          fileObj.content
        );
        setBmcData(parsedData);
        setBmcTitle(title);
        setFileName(fileObj.filename || "Shared BMC");

        if (isMobile) {
          setTransform({ x: 20, y: 20, scale: 0.4 });
        } else {
          setTransform({ x: 50, y: 50, scale: 0.8 });
        }

        setCanvasHasContent(true);
        setButtonsExpanded(false);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        showToastMessage("🔗 Shared BMC loaded successfully!");
      } catch (e) {
        // ignore if invalid
      }
    }
  }, [parseMarkdownToBMC, isMobile]);

  // Share button handler
  const handleShare = () => {
    let markdown = rawMarkdown;
    let filename = fileName || "Shared BMC";
    if (!markdown && bmcData) {
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

    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToastMessage("🔗 Shareable link copied to clipboard!");
      })
      .catch(() => {
        showToastMessage("❌ Failed to copy link to clipboard");
      });

    setButtonsExpanded(true);
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        mobileMenuOpen &&
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".mobile-menu-button") &&
        !e.target.closest(".floating-button")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobile, mobileMenuOpen]);

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
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`${
              isDarkMode
                ? "bg-gray-800 border-gray-600 text-gray-100"
                : "bg-white border-gray-200 text-gray-800"
            } border rounded-lg px-4 py-3 shadow-lg flex items-center space-x-2 max-w-sm`}
          >
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Mobile Floating Buttons */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 flex space-x-3">
          {/* Hamburger Menu Button */}
          <button
            className={`floating-button mobile-menu-button transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-full shadow-lg border focus:outline-none ${
              buttonsExpanded ? "w-12 h-12" : "w-7 h-7"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonTouch();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            <div className="w-full h-full flex items-center justify-center">
              {mobileMenuOpen ? (
                <X
                  className={`transition-all duration-200 ${
                    buttonsExpanded ? "w-6 h-6" : "w-4 h-4"
                  } ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                />
              ) : (
                <Menu
                  className={`transition-all duration-200 ${
                    buttonsExpanded ? "w-6 h-6" : "w-4 h-4"
                  } ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                />
              )}
            </div>
          </button>

          {/* Share Button */}
          <button
            className={`floating-button transition-all duration-300 ${
              isDarkMode
                ? "bg-purple-800 hover:bg-purple-700 border-purple-700"
                : "bg-purple-600 hover:bg-purple-700 border-purple-500"
            } rounded-full shadow-lg border focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
              buttonsExpanded ? "w-12 h-12" : "w-7 h-7"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonTouch();
              handleShare();
            }}
            disabled={!bmcData && !rawMarkdown}
            aria-label="Share canvas"
          >
            <div className="w-full h-full flex items-center justify-center">
              <Share2
                className={`transition-all duration-200 ${
                  buttonsExpanded ? "w-6 h-6" : "w-4 h-4"
                } text-white`}
              />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          className={`mobile-menu fixed top-20 left-4 z-50 w-80 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-xl shadow-xl border transition-all duration-300`}
        >
          <div className="p-4">
            {/* Menu Header */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`font-bold text-lg ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                BMC Canvas
              </h2>
            </div>

            {/* File Info */}
            {fileName && (
              <div
                className={`flex items-center space-x-2 ${
                  isDarkMode
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-50 text-blue-700"
                } px-3 py-2 rounded-lg mb-4`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium truncate">{fileName}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* File Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 ${
                    isDarkMode
                      ? "bg-blue-700 hover:bg-blue-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white px-4 py-3 rounded-lg transition-colors`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Select BMC File</span>
                </button>

                <button
                  onClick={() => {
                    downloadTemplate();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 ${
                    isDarkMode
                      ? "bg-green-800 hover:bg-green-700 text-green-200"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  } px-4 py-3 rounded-lg transition-colors`}
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Download Template</span>
                </button>
              </div>

              {/* View Controls */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      zoomIn();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } px-3 py-3 rounded-lg transition-colors`}
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm">Zoom +</span>
                  </button>

                  <button
                    onClick={() => {
                      zoomOut();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } px-3 py-3 rounded-lg transition-colors`}
                  >
                    <ZoomOut className="w-4 h-4" />
                    <span className="text-sm">Zoom -</span>
                  </button>

                  <button
                    onClick={() => {
                      fitToView();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } px-3 py-3 rounded-lg transition-colors`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-sm">Fit</span>
                  </button>

                  {/* <button
                    onClick={() => {
                      fitToView();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "bg-emerald-800 hover:bg-emerald-700 text-emerald-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    } px-3 py-3 rounded-lg transition-colors`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-sm">Fit</span>
                  </button> */}

                  <button
                    onClick={() => {
                      resetView();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } px-3 py-3 rounded-lg transition-colors`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">Reset</span>
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <button
                  onClick={() => {
                    toggleDarkMode();
                  }}
                  className={`w-full flex items-center space-x-3 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  } px-4 py-3 rounded-lg transition-colors`}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
              </div>

              {/* Zoom Info */}
              <div className="text-center">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Zoom: {Math.round(transform.scale * 100)}%
                </span>
              </div>

              {/* Mobile Usage Tips */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <div
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } space-y-1`}
                >
                  <p>
                    💡 <strong>Touch Tips:</strong>
                  </p>
                  <p>• Single finger: Drag to pan</p>
                  <p>• Two fingers: Pinch to zoom</p>
                  <p>• Buttons shrink during interaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header - Hidden on Mobile */}
      {!isMobile && (
        <>
          {/* Top Bar (Header) */}
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

              <button
                onClick={handleShare}
                className={`flex items-center space-x-2 ${
                  isDarkMode
                    ? "bg-purple-800 hover:bg-purple-700 text-purple-400"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-600"
                } px-4 py-2 rounded-lg transition-colors font-medium`}
                disabled={!bmcData && !rawMarkdown}
              >
                <Share2 className="w-4 h-4" />
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
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Canvas */}
      <div
        className="flex-1 relative"
        style={{
          ...hideScrollbarStyle,
          minHeight: isMobile ? "100vh" : "auto",
          minWidth: isMobile ? "100vw" : "auto",
        }}
      >
        <div
          ref={canvasRef}
          className={`w-full h-full bmc-canvas-area ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            minWidth: "100%",
            minHeight: "100%",
            ...hideScrollbarStyle,
          }}
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
                className={`${
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
                  {isMobile
                    ? "Tap the menu button to upload your Business Model Canvas file. Use pinch gestures to zoom and single finger to pan."
                    : "Select a markdown file to generate your Business Model Canvas visualization"}
                </p>
                {!isMobile && (
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
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Hidden on Mobile */}
      {!isMobile && (
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
            🔒 Your files never leave your browser - completely private and
            secure
          </div>
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Made with ❤️ for pitchers
          </div>
        </div>
      )}
    </div>
  );
};

// Unicode-safe base64 encode/decode
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
