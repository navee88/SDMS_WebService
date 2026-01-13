import React, { useState, useRef, useEffect } from 'react';
import {
    Check, ChevronDown, RefreshCw, Calendar, Clock, Pencil, Search
} from 'lucide-react';
import useAxios from '../../../../../Services/servicecall';
import CF_activeUserdetails from '../../../../../Services/activeUserdetails';


const SearchServerData = () => {
    // State
    const [isSchedulerMetadataEnabled, setIsSchedulerMetadataEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState('File Settings');
    const { postData } = useAxios();
    const [clientOptions, setClientOptions] = useState([]);
    const [domainOptions, setDomainOptions] = useState([]);
    const [destinationOptions, setDestinationOptions] = useState([]);
    const [templateOptions, setTemplateOptions] = useState([]);
    const [delimiterOptions, setDelimiterOptions] = useState([]);
    const [tagMasterData, setTagMasterData] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    const [selectedDelimiter, setSelectedDelimiter] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');

    // Ref for the scrollable container (The specific div that scrolls)
    const scrollContainerRef = useRef(null);

    // Refs for Sections
    const fileSettingsRef = useRef(null);
    const uploadPolicyRef = useRef(null);
    const triggerExpiryRef = useRef(null);
    const scheduleCaptureRef = useRef(null);
    const schedulerMetadataRef = useRef(null);



    // Load all combos on screen load
    const loadCombos = async () => {
        try {
            const requestData = CF_activeUserdetails();

            // Client Combo
            const clientResponse = await postData(
                'Scheduler/DataSchedulerClientCombo',
                requestData
            );
            setClientOptions(clientResponse || []);

            // Domain Combo
            const domainResponse = await postData(
                'Scheduler/DataSchedulerDomainCombo',
                requestData
            );
            // Set NONE as default selected
            setDomainOptions(domainResponse || []);

            if (domainResponse && domainResponse.length > 0) {
                setSelectedDomain(domainResponse[0].L03DomainID);
            }

            // Destination Combo
            const destinationResponse = await postData(
                'Scheduler/DataSchedulerDestinationCombo',
                requestData
            );
            setDestinationOptions(destinationResponse || []);

            // Template Combo
            const templateResponse = await postData(
                'InstrumentLock/LockTemplateCombo',
                requestData
            );
            setTemplateOptions(templateResponse || []);

            // Auto-select first template
            // if (templateResponse && templateResponse.length > 0) {
            //     setSelectedTemplate(templateResponse[0].sTemplateID);
            //     loadTagMaster(templateResponse[0].sTemplateID);
            // }

            // if (templateResponse && templateResponse.length > 0) {
            //     const firstTemplateId = templateResponse[0].sTemplateID;
            //     setSelectedTemplate(firstTemplateId);
            //     // loadTagMaster(firstTemplateId);
            // }

            if (templateResponse && templateResponse.length > 0) {
                const firstTemplateId = templateResponse[0].sTemplateID;
                console.log("Auto-selected template:", firstTemplateId);
                setSelectedTemplate(firstTemplateId);
            }



            // Delimiter Combo
            const delimiterResponse = await postData(
                'Scheduler/LoadDelimeter',
                requestData
            );
            setDelimiterOptions(delimiterResponse || []);

        } catch (error) {
            console.error("Error loading combos:", error);
        }
    };

    // Load Tag Master based on selected template
    const loadTagMaster = async (templateId) => {
        console.log("=== loadTagMaster called ===");
        console.log("templateId:", templateId);
        console.log("isSchedulerMetadataEnabled:", isSchedulerMetadataEnabled);

        try {
            const requestData = {
                sTemplateID: templateId,
                sInstrumentID: "",
                ...CF_activeUserdetails()
            };

            console.log("Tag API Request:", requestData);

            const response = await postData(
                'Scheduler/GetTagMasterByTemplate',
                requestData
            );

            console.log("Tag API Response:", response);

            setTagMasterData(response || []);
        } catch (error) {
            console.error("Tag master load failed:", error);
            setTagMasterData([]);
        }
    };


    // useEffect(() => {
    //     if (!isSchedulerMetadataEnabled) return;
    //     if (!selectedTemplate) return;

    //     console.log("Loading tags for template:", selectedTemplate);

    //     loadTagMaster(selectedTemplate);
    // }, [isSchedulerMetadataEnabled, selectedTemplate]);
    useEffect(() => {
        if (isSchedulerMetadataEnabled && selectedTemplate) {
            console.log("Loading tags for template:", selectedTemplate);
            loadTagMaster(selectedTemplate);
        }
    }, [isSchedulerMetadataEnabled, selectedTemplate]);


    useEffect(() => {
        loadCombos();
    }, []);

    // Scroll Handler (Manual Calculation to prevent Header movement)
    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);

        if (ref.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = ref.current;

            // Get positions relative to the viewport
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate the position inside the container
            // currentScroll + (difference between element top and container top)
            // We subtract 20px for a little visual padding at the top
            const offsetPosition = container.scrollTop + (elementRect.top - containerRect.top) - 20;

            container.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            {/* Fixed Navbar - Will not move because scrolling is handled in the div below */}
            <header className="z-10 bg-white border-b border-gray-200 shadow-sm flex-none h-16 sticky top-0">
                <div className="flex items-center justify-between px-8 h-full">
                    <nav className="flex space-x-6 h-full">
                        <NavItem
                            label="File Settings"
                            active={activeTab === 'File Settings'}
                            onClick={() => scrollToSection(fileSettingsRef, 'File Settings')}
                        />
                        <NavItem
                            label="Upload Policy"
                            active={activeTab === 'Upload Policy'}
                            onClick={() => scrollToSection(uploadPolicyRef, 'Upload Policy')}
                        />
                        <NavItem
                            label="Schedule Trigger/Expiry On"
                            active={activeTab === 'Schedule Trigger/Expiry On'}
                            onClick={() => scrollToSection(triggerExpiryRef, 'Schedule Trigger/Expiry On')}
                        />
                        <NavItem
                            label="Schedule Capture"
                            active={activeTab === 'Schedule Capture'}
                            onClick={() => scrollToSection(scheduleCaptureRef, 'Schedule Capture')}
                        />
                        <NavItem
                            label="Scheduler Metadata"
                            active={activeTab === 'Scheduler Metadata'}
                            onClick={() => scrollToSection(schedulerMetadataRef, 'Scheduler Metadata')}
                        />
                    </nav>

                    <div className="flex items-center gap-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-[5px] shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 transform active:scale-95">
                            <div className="w-4 h-4 border-2 border-white rounded flex items-center justify-center">
                                <Check size={10} strokeWidth={4} />
                            </div>
                            <span>Submit</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 px-4 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-200">
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area - Attach ref here */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto pt-4 relative"
            >
                <main className="px-2">
                    <div className="max-w-8xl mx-auto space-y-8 pb-20">
                        {/* File Settings Section */}
                        <div
                            ref={fileSettingsRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="File Settings" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12 mb-12">
                                <div className="space-y-10">
                                    {/* <UnderlineSelect label="Client Name" required /> */}
                                    <UnderlineSelect
                                        label="Client Name"
                                        required
                                        options={clientOptions}
                                        displayKey="L06ClientName"
                                        valueKey="L06ClientID"
                                        value={selectedClient}
                                        onChange={(value) => setSelectedClient(value)}
                                    />
                                    <UnderlineSelect label="Instrument" required />
                                    <UnderlineSelect label="Default Parser Method" />
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <label className="block text-gray-600 text-sm font-bold">Path Type</label>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-gray-700 text-sm font-medium">Local Path</span>
                                            <ToggleSwitch checked={true} />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <UnderlineInput label="Source Path" required />
                                        <div className="absolute right-0 top-6">
                                            <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                                                <Check size={16} strokeWidth={3} /> Check
                                            </button>
                                        </div>
                                        <p className="text-gray-400 text-xs mt-3 font-medium">NOTE:- Browse is not supported. Manually copy the path</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gray-600 font-bold text-base mb-8">UNC Credentials</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-10">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <label className="text-gray-600 text-sm font-bold">UNC Path</label>
                                            <ToggleSwitch checked={false} />
                                        </div>
                                        <div>
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1"><UnderlineInput label="UNC Path" /></div>
                                                <button className="bg-blue-50 text-blue-600 border-1 border-gray-500 hover:bg-blue-100 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors mb-1">
                                                    <Check size={16} strokeWidth={3} /> Check
                                                </button>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-3 font-medium">NOTE:- Browse is not supported. Manually copy the path</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <UnderlineInput label="Username" />
                                            <UnderlineInput label="Password" type="password" />
                                        </div>
                                        {/* <UnderlineSelect label="Domain" placeholder="NONE" /> */}
                                        <UnderlineSelect
                                            label="Domain"
                                            options={domainOptions}
                                            displayKey="L03DomainName"
                                            valueKey="L03DomainID"
                                            value={selectedDomain}
                                            onChange={(value) => setSelectedDomain(value)}
                                        />
                                    </div>
                                    <div className="space-y-10">
                                        {/* <UnderlineSelect label="Destination" required /> */}
                                        <UnderlineSelect
                                            label="Destination"
                                            required
                                            options={destinationOptions}
                                            displayKey="L09FTPAliasName"
                                            valueKey="L09FTPID"
                                            value={selectedDestination}
                                            onChange={(value) => setSelectedDestination(value)}
                                        />
                                        <UnderlineInput label="Filter" defaultValue="*.*" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Policy Section */}
                        <div
                            ref={uploadPolicyRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Upload Policy" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12">
                                <div className="space-y-8">
                                    <SquareCheckbox label="Include Subfolder" />
                                    <div className="flex items-center gap-6">
                                        <ToggleLabel label="Complete Tree" />
                                        <div className="flex items-center gap-3">
                                            <ToggleLabel label="Level" />
                                            <div className="w-24 bg-gray-100 h-8 rounded border border-gray-200"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 pt-2">
                                        <ToggleLabel label="Copy Files" checked={true} />
                                        <ToggleLabel label="Move Files(Do not leave local copy)" />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <SquareCheckbox label="Delete local copy" />
                                    <div className="flex items-end gap-4">
                                        <ToggleLabel label="Files older than" />
                                        <div className="w-16 border-b border-gray-300"></div>
                                        <div className="w-24 relative">
                                            <span className="text-gray-400 text-sm">Days</span>
                                            <div className="absolute right-0 top-1"><ChevronDown size={14} className="text-gray-400" /></div>
                                            <div className="border-b border-gray-300 w-full mt-1"></div>
                                        </div>
                                    </div>
                                    <div className="w-48 relative -mt-4 pl-32">
                                        <span className="text-gray-300 text-sm italic">automatic</span>
                                        <div className="absolute right-0 top-1"><ChevronDown size={14} className="text-gray-300" /></div>
                                        <div className="border-b border-gray-200 w-full mt-1"></div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-2">
                                        <ToggleLabel label="Files older than" />
                                        <DateInput value="05/01/2026" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Trigger/Expiry On Section */}
                        <div
                            ref={triggerExpiryRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Schedule Trigger/Expiry On" />
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <label className="text-gray-600 text-sm font-bold w-24">Trigger on</label>
                                    <DateInput value="05/01/2026" />
                                    <TimeInput value="19:00:26" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-24"></div>
                                    <div className="-ml-24 flex items-center gap-4">
                                        <SquareCheckbox label="Expiry Date & Time" boldLabel />
                                        <DateInput value="05/01/2026" />
                                        <TimeInput value="19:00:26" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Policies & Logger Section */}
                        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">File Delete Policy</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <SquareCheckbox />
                                            <div className="flex-1">
                                                <label className="text-sm text-gray-800 font-medium block mb-1">Apply Delete Policy for Server Files</label>
                                                <div className="relative w-32">
                                                    <div className="w-full border-b border-gray-300 pb-1 text-gray-400 text-sm">automatic</div>
                                                    <div className="absolute right-0 top-0"><ChevronDown size={14} className="text-gray-400" /></div>
                                                </div>
                                            </div>
                                        </div>
                                        <SquareCheckbox label="Enable file link" boldLabel />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Compliance Policy</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox label="Enable File Audit" boldLabel />
                                        <div className="flex items-center gap-4">
                                            <label className="text-gray-600 text-sm font-bold w-20">Audit Filter</label>
                                            <div className="flex-1">
                                                <input type="text" defaultValue="*.*" className="w-full bg-transparent border-b border-gray-300 pb-1 text-sm text-gray-600 focus:outline-none focus:border-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-blue-600 font-bold text-sm">Data Logger</h3>
                                    <div className="space-y-6">
                                        <SquareCheckbox label="Data Logger" boldLabel />
                                        <div className="flex items-center gap-2">
                                            <label className="text-gray-600 text-sm font-bold w-16">Archival</label>
                                            <div className="w-20 border-b border-gray-300 bg-gray-50 h-6"></div>
                                            <span className="text-gray-600 text-sm font-bold">Days Older</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Capture Section */}
                        <div
                            ref={scheduleCaptureRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Schedule Capture" />
                            <div className="space-y-6">
                                <SquareCheckbox label="Live Capture" boldLabel checked={true} />
                                <div className="flex items-center gap-8 pl-1">
                                    <ToggleLabel label="Live Capture Versioning" checked={true} />
                                    <ToggleLabel label="One version per Day" />
                                    <ToggleLabel label="Without Versioning" />
                                </div>
                            </div>
                        </div>

                        {/* Scheduler Metadata Section */}
                        <div
                            ref={schedulerMetadataRef}
                            className="bg-white rounded-md shadow-sm border border-gray-200 p-8"
                        >
                            <SectionHeader title="Scheduler Metadata" />
                            <div className="mb-8">
                                <SquareCheckbox
                                    label="Enable Scheduler Metadata"
                                    boldLabel
                                    checked={isSchedulerMetadataEnabled}
                                    onChange={() => setIsSchedulerMetadataEnabled(!isSchedulerMetadataEnabled)}
                                />
                            </div>

                            {isSchedulerMetadataEnabled && (
                                <div className="space-y-8">


                                    <div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 mb-6">
                                            {/* <UnderlineSelect label="Template Master" placeholder="QC" /> */}
                                            <UnderlineSelect
                                                label="Template Master"
                                                options={templateOptions}
                                                displayKey="sTemplateName"
                                                valueKey="sTemplateID"
                                                value={selectedTemplate}
                                                // onChange={(value) => {
                                                //     setSelectedTemplate(value);
                                                //     loadTagMaster(value);
                                                // }}
                                                // onChange={(value) => {
                                                //     setSelectedTemplate(value);
                                                // }}
                                                onChange={(value) => {
                                                    console.log("Template changed to:", value);
                                                    setSelectedTemplate(value);
                                                    if (isSchedulerMetadataEnabled) {
                                                        loadTagMaster(value);
                                                    }
                                                }}

                                            />
                                            <UnderlineInput label="Sample Filename" />
                                            {/* <UnderlineSelect label="Delimiter" /> */}
                                            <UnderlineSelect
                                                label="Delimiter"
                                                options={delimiterOptions}
                                                displayKey="sDelimiterName"
                                                valueKey="sDelimiterID"
                                                value={selectedDelimiter}
                                                onChange={(value) => setSelectedDelimiter(value)}
                                            />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 w-1/4">TagName</th>
                                                        <th scope="col" className="px-6 py-3 w-1/2">Extract From</th>
                                                        <th scope="col" className="px-6 py-3 w-1/4">Metadata</th>
                                                        <th scope="col" className="px-6 py-3 w-16"></th>
                                                    </tr>
                                                </thead>
                                                {/* <tbody>
                                                    <tr className="bg-blue-50/30 border-b border-gray-100">
                                                        <td className="px-6 py-4 font-medium text-gray-900">Sample</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <RadioButton label="NONE" name="row1" />
                                                                <RadioButton label="Folder" name="row1" />
                                                                <RadioButton label="Filename" name="row1" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4"></td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white border-b border-gray-100">
                                                        <td className="px-6 py-4 font-medium text-gray-900">Test</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <RadioButton label="NONE" name="row2" />
                                                                <RadioButton label="Folder" name="row2" />
                                                                <RadioButton label="Filename" name="row2" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4"></td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                    </tr>
                                                </tbody> */}

                                                <tbody>
                                                    {tagMasterData && tagMasterData.length > 0 ? (
                                                        tagMasterData.map((tag, index) => (
                                                            <tr
                                                                key={tag.sTagID}
                                                                className={index % 2 === 0
                                                                    ? "bg-blue-50/30 border-b border-gray-100"
                                                                    : "bg-white border-b border-gray-100"}
                                                            >
                                                                {/* Tag Name */}
                                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                                    {tag.sTagName}
                                                                </td>

                                                                {/* Extract From */}
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <RadioButton
                                                                            label="NONE"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={!tag.sSourceFlag || tag.sSourceFlag === 'NONE'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Folder"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Folder'}
                                                                        />
                                                                        <RadioButton
                                                                            label="Filename"
                                                                            name={`extract_${tag.sTagID}`}
                                                                            checked={tag.sSourceFlag === 'Filename'}
                                                                        />
                                                                    </div>
                                                                </td>

                                                                {/* Metadata */}
                                                                <td className="px-6 py-4">
                                                                    {tag.sTextData || ''}
                                                                </td>

                                                                {/* Action */}
                                                                <td className="px-6 py-4 text-right">
                                                                    <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                                No tags found for selected template
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                    <div>
                                        <h3 className="text-blue-600 font-bold text-sm mb-4">Rule</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-6 mb-6">
                                            <UnderlineSelect label="Rule Name" placeholder="Sample" />
                                            <UnderlineInput label="Metadata" />
                                        </div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">TagName</th>
                                                        <th scope="col" className="px-6 py-3">Relational Operator</th>
                                                        <th scope="col" className="px-6 py-3">Field Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-blue-50/30 border-b border-gray-100">
                                                        <td className="px-6 py-4 font-medium text-gray-900"></td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Pencil size={16} className="text-blue-600 cursor-pointer" />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>



                                    <div>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-200">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Rule Name <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Metadata <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                TagName <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Relational Operator <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                        <th scope="col" className="px-6 py-3">
                                                            <div className="flex items-center justify-between">
                                                                Field Value <Search size={14} className="text-gray-400" />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                            No data to display
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end">
                                            <button className="bg-gray-100 hover:bg-gray-200 text-blue-600 font-bold py-2 px-6 rounded text-sm transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Reusable Components
const SectionHeader = ({ title }) => (
    <div className="mb-6 border-b border-gray-100 pb-2">
        <h2 className="text-lg font-semibold text-blue-600">{title}</h2>
    </div>
);

const NavItem = ({ label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`relative h-full flex items-center px-2 cursor-pointer transition-colors group`}
    >
        <span className={`text-sm font-medium transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
            {label}
        </span>
        {active && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-md" />}
    </div>
);

// const UnderlineSelect = ({ label, required, placeholder }) => (
//     <div className="relative group w-full">
//         <label className="block text-gray-600 text-sm font-bold mb-2">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="relative">
//             <select className="w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors">
//                 <option>{placeholder || ""}</option>
//             </select>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
//                 <ChevronDown size={14} className="text-blue-500 fill-current" />
//             </div>
//         </div>
//     </div>
// );

// const UnderlineSelect = ({ label, required, placeholder, options = [], value, onChange, displayKey = 'name', valueKey = 'id' }) => (
//     <div className="relative group w-full">
//         <label className="block text-gray-600 text-sm font-bold mb-2">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="relative">
//             <select
//                 value={value}
//                 onChange={(e) => onChange && onChange(e.target.value)}
//                 className="w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors"
//             >
//                 {/* <option value="">{placeholder || ""}</option> */}
//                 {options.map((option, index) => (
//                     <option key={index} value={option[valueKey]}>
//                         {option[displayKey]}
//                     </option>
//                 ))}
//             </select>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
//                 <ChevronDown size={14} className="text-blue-500 fill-current" />
//             </div>
//         </div>
//     </div>
// );

// const UnderlineSelect = ({ label, required, placeholder, options = [], value, onChange, displayKey = 'name', valueKey = 'id' }) => (
//     <div className="relative group w-full">
//         <label className="block text-gray-600 text-sm font-bold mb-2">
//             {label} {required && <span className="text-red-500">*</span>}
//         </label>
//         <div className="relative">
//             <select
//                 value={value || ""}
//                 onChange={(e) => onChange && onChange(e.target.value)}
//                 className="w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors"
//             >
//                 {/* Placeholder option - hidden from dropdown but shows when nothing selected */}
//                 <option value="" disabled hidden>{placeholder || ""}</option>

//                 {options.map((option, index) => (
//                     <option key={index} value={option[valueKey]}>
//                         {option[displayKey]}
//                     </option>
//                 ))}
//             </select>
//             <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
//                 <ChevronDown size={14} className="text-blue-500 fill-current" />
//             </div>
//         </div>
//     </div>
// );


const UnderlineSelect = ({ label, required, placeholder, options = [], value, onChange, displayKey = 'name', valueKey = 'id' }) => (
    <div className="relative group w-full">
        <label className="block text-gray-600 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                value={value || ""}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="w-full bg-transparent border-b-2 border-gray-200 py-2 pr-8 text-gray-700 text-sm focus:border-blue-400 focus:outline-none appearance-none cursor-pointer transition-colors"
            >
                {/* Empty placeholder - shows blank but hidden from dropdown list */}
                <option value="" disabled hidden></option>

                {options.map((option, index) => (
                    <option key={index} value={option[valueKey]}>
                        {option[displayKey]}
                    </option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-blue-500 fill-current" />
            </div>
        </div>
    </div>
);
const UnderlineInput = ({ label, required, placeholder, defaultValue, type = "text" }) => (
    <div className="group w-full relative">
        <label className="block text-gray-700 text-sm font-bold mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-gray-700 text-sm focus:border-blue-400 focus:outline-none transition-colors"
        />
    </div>
);

const ToggleSwitch = ({ checked }) => (
    <div className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
);

const SquareCheckbox = ({ label, boldLabel, checked, onChange }) => (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
            {checked && <Check size={14} className="text-white" strokeWidth={3} />}
        </div>
        {label && <span className={`text-sm text-blue-800 ${boldLabel ? 'font-bold' : 'font-medium'}`}>{label}</span>}
    </div>
);

const ToggleLabel = ({ label, checked }) => (
    <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${checked ? 'text-blue-600' : 'text-blue-800'}`}>{label}</span>
        <div className={`w-8 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
    </div>
);

const DateInput = ({ value }) => (
    <div className="relative w-40">
        <input
            type="text"
            defaultValue={value}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-blue-400"
        />
        <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

const TimeInput = ({ value }) => (
    <div className="relative w-32">
        <input
            type="text"
            defaultValue={value}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-blue-400"
        />
        <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
);

// const RadioButton = ({ label, name, checked }) => (
//     <label className="flex items-center cursor-pointer group">
//         <input type="radio" name={name} className="hidden peer" defaultChecked={checked} />
//         <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors relative">
//             <div className="w-2 h-2 bg-blue-500 rounded-full scale-0 peer-checked:scale-100 transition-transform absolute"></div>
//         </div>
//         <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600">{label}</span>
//     </label>
// );

const RadioButton = ({ label, name, checked, onChange }) => (
    <label className="flex items-center cursor-pointer group">
        <input
            type="radio"
            name={name}
            className="hidden peer"
            checked={checked}
            onChange={onChange}
        />
        <div className="w-4 h-4 border border-gray-300 rounded-full flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-white transition-colors relative">
            <div className={`w-2 h-2 bg-blue-500 rounded-full transition-transform ${checked ? 'scale-100' : 'scale-0'}`}></div>
        </div>
        <span className="ml-2 text-sm text-gray-700 font-bold group-hover:text-blue-600">{label}</span>
    </label>
);

export default SearchServerData;
