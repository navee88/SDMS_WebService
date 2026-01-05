// import React, { useState } from 'react';
// import { CheckSquare } from 'lucide-react';
// import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

// const drawerWidthCollapsed = 60;
// const topBarHeight = 60;

// export default function PasswordPolicy() {
//   const [dbLogin, setDbLogin] = useState(true);
//   const [complexPolicy, setComplexPolicy] = useState(true);

//   const tabLabels = ["Password Policy"];

//   return (
//     <div
//       className="fixed"
//       style={{
//         top: `${topBarHeight}px`,
//         left: `${drawerWidthCollapsed}px`,
//         width: `calc(100% - ${drawerWidthCollapsed}px)`,
//         height: `calc(100vh - ${topBarHeight}px)`,
//       }}
//     >
//       <div className="h-full bg-[#f1f3f5] flex flex-col">
//         <div className="border-b border-[#ccc]" />
        
//         <div className="flex gap-8 border-b">
//           {tabLabels.map((label, idx) => (
//             <button
//               key={idx}
//               className={`pb-2 px-1 text-[1.4rem] font-semibold capitalize transition-colors ${
//                 idx === 0
//                   ? 'text-[#034896] border-b-2 border-[#1565c0]'
//                   : 'text-[#666] hover:text-[#034896]'
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
        
//         {/* Main white background content */}
//         <div className="flex-1 px-8 py-6 bg-white rounded overflow-auto">
//           {/* Top row: Database login (left), Save button (right) */}
//           <div className="flex items-center justify-between mb-2">
//             {/* Left: Database Login */}
//             <div className="flex items-center">
//               <span className="mr-3 text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
//                 Database Based Login
//               </span>
//               <div className="relative inline-block w-4 align-middle select-none">
//                 <input
//                   type="checkbox"
//                   checked={dbLogin}
//                   onChange={() => setDbLogin(!dbLogin)}
//                   className="sr-only"
//                   id="db-login-toggle"
//                 />
//                 <label
//                   htmlFor="db-login-toggle"
//                   className={`block h-5 w-10 rounded-full cursor-pointer transition-colors ${
//                     dbLogin ? 'bg-blue-600' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span
//                     className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
//                       dbLogin ? 'transform translate-x-5' : ''
//                     }`}
//                   />
//                 </label>
//               </div>
//             </div>

//             {/* Right: Save button */}
//             <button className="flex items-center gap-1 px-3 py-1.5 bg-[#f3f3f3] text-[#3992f8] font-semibold text-[12px] rounded hover:bg-[#e7e7e7] transition-colors">
//               <CheckSquare className="w-4 h-4" />
//               Save
//             </button>
//           </div>

//           {/* Main content area with two columns */}
//           <div className="flex">
//             {/* Left column - Password Policy */}
//             <div className="w-100% ">
//               <div className="space-y-0">
//                 {[
//                   { label: "Minimum Password Length(Between 4 and 20 Characters)" },
//                   { label: "Maximum Password Length(Between 4 and 20 Characters)" },
//                   { label: "Password History(Between 1 and 5 Times)" },
//                   { label: "Password Expiry(Between 1 and 180 Days)"},
//                   { label: "Autolock Policy(Between 1 and 5 Times)" },
//                 ].map((item, i) => (
//                   <div key={i} className="flex flex-col">
//                     <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
//                       {item.label}
//                     </label>
//                     <div className="flex items-center">
//                       <AnimatedInput
//                         type="number"
//                         defaultValue={0}
//                         min="1"
//                         max={item.label.includes("Password Length") ? "20" : 
//                              item.label.includes("History") ? "5" : 
//                              item.label.includes("Expiry") ? "180" : "5"}
//                       />
                      
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right column - Complex Password Policy */}
//             <div className="w-100% ml-14 mb-0 ">
//               <div className="mb-0">
//                 <h2 className="text-[#0049b0] font-roboto font-bold text-[14px] mb-2">
//                   Complex Password Policy
//                 </h2>
//                 <h2 className="text-[#405f7d] font-bold font-roboto text-[12px] mb-4">
//                   Complex Password Policy
//                 </h2>
                
//                 {/* NOTE - yellow highlight */}
//                 <div className="px-0 py-0 bg-[#ff0] mb-6 max-w-[615px]">
//                   <p className="font-semibold font-roboto text-[#405f7d] text-[12px]">
//                     NOTE: The total length of complex password must be greater than or equal to
//                     minimum password length and less than or equal to maximum password length.
//                   </p>
//                 </div>

//                 {/* Inputs for complex password */}
//                 <div >
//                   {[
//                     { label: "Minimum number of Uppercase characters" },
//                     { label: "Minimum number of Lowercase characters" },
//                     { label: "Minimum number of Numeric characters" },
//                     { label: "Minimum number of Special characters" },
//                   ].map((item, idx) => (
//                     <div key={idx} className="flex flex-col">
//                       <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
//                         {item.label}
//                       </label>
//                       <div className="flex items-center">
//                         <AnimatedInput
//                           type="number"
//                           defaultValue={item.value}
//                           min="0"
//                           max="20"
//                         />
                        
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }












































import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import AnimatedInput from '../../../../Layout/Common/AnimatedInput';

const drawerWidthCollapsed = 60;
const topBarHeight = 60;

export default function PasswordPolicy() {
  const [dbLogin, setDbLogin] = useState(true);
  const [complexPolicy, setComplexPolicy] = useState(true);
  const [values, setValues] = useState({
    minPasswordLength: 4,
    maxPasswordLength: 10,
    passwordHistory: 5,
    passwordExpiry: 90,
    autolockPolicy: 3,
    minUppercase: 0,
    minLowercase: 0,
    minNumeric: 0,
    minSpecial: 0,
  });

  const tabLabels = ["Password Policy"];

  const handleValueChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  return (
    <div
      className="fixed"
      style={{
        top: `${topBarHeight}px`,
        left: `${drawerWidthCollapsed}px`,
        width: `calc(100% - ${drawerWidthCollapsed}px)`,
        height: `calc(100vh - ${topBarHeight}px)`,
      }}
    >
      <div className="h-full bg-[#f1f3f5] flex flex-col">
        <div className="border-b border-[#ccc]" />
        
        <div className="flex gap-8 border-b">
          {tabLabels.map((label, idx) => (
            <button
              key={idx}
              className={`pb-2 px-1 text-[1.4rem] font-semibold capitalize transition-colors ${
                idx === 0
                  ? 'text-[#034896] border-b-2 border-[#1565c0]'
                  : 'text-[#666] hover:text-[#034896]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Main white background content */}
        <div className="flex-1 px-4 py-4 bg-white rounded overflow-auto">
          {/* Top row: Database login (left), Save button (right) */}
          <div className="flex items-center justify-between mb-2">
            {/* Left: Database Login */}
            <div className="flex items-center">
              <span className="mr-3 text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                Database Based Login
              </span>
              <div className="relative inline-block w-10 align-middle select-none">
                <input
                  type="checkbox"
                  checked={dbLogin}
                  onChange={() => setDbLogin(!dbLogin)}
                  className="sr-only"
                  id="db-login-toggle"
                />
                <label
                  htmlFor="db-login-toggle"
                  className={`block h-5 w-10 rounded-full cursor-pointer transition-colors ${
                    dbLogin ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                      dbLogin ? 'transform translate-x-5' : ''
                    }`}
                  />
                </label>
              </div>
            </div>
            
            {/* Center: Complex password policy heading */}
            <h2 className="text-[#0049b0] font-roboto font-bold text-[14px] mb-0">
              Complex password policy
            </h2>

            {/* Right: Save button */}
            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#f3f3f3] text-[#3992f8] font-semibold text-[12px] rounded hover:bg-[#e7e7e7] transition-colors">
              <CheckSquare className="w-4 h-4" />
              Save
            </button>
          </div>

          {/* Main content area with two columns */}
          <div className="flex gap-8">
            {/* Left column - Password Policy */}
            <div className="w-auto">
              <div className="space-y-0">
                {[
                  { 
                    label: "Minimum Password Length(Between 4 and 20 Characters)", 
                    field: "minPasswordLength", 
                    defaultValue: 4,
                    min: 4,
                    max: 20
                  },
                  { 
                    label: "Maximum Password Length(Between 4 and 20 Characters)", 
                    field: "maxPasswordLength", 
                    defaultValue: 10,
                    min: 4,
                    max: 20
                  },
                  { 
                    label: "Password History(Between 1 and 5 Times)", 
                    field: "passwordHistory", 
                    defaultValue: 5,
                    min: 1,
                    max: 5
                  },
                  { 
                    label: "Password Expiry(Between 1 and 180 Days)", 
                    field: "passwordExpiry", 
                    defaultValue: 90,
                    min: 1,
                    max: 180
                  },
                  { 
                    label: "Autolock Policy(Between 1 and 5 Times)", 
                    field: "autolockPolicy", 
                    defaultValue: 3,
                    min: 1,
                    max: 5
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col mb-4">
                    <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                      {item.label}
                    </label>
                    <div className="w-65"> {/* Increased width */}
                      <AnimatedInput
                        type="number"
                        value={values[item.field]}
                        onChange={(e) => handleValueChange(item.field, e.target.value)}
                        min={item.min}
                        max={item.max}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Complex Password Policy */}
            <div className="w-1/2 ml-14">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[#405f7d] font-semibold font-roboto text-[12px] mb-0">
                      Complex Password Policy
                    </h2>
                    <input
                      type="checkbox"
                      checked={complexPolicy}
                      onChange={() => setComplexPolicy(!complexPolicy)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {complexPolicy && (
                <>
                  {/* NOTE - yellow highlight */}
                  <div className="px-0 py-0 bg-[#ff0] mb-6 max-w-[615px]">
                    <p className="font-semibold font-roboto text-[#405f7d] text-[12px]">
                      NOTE: The total length of complex password must be greater than or equal to
                      minimum password length and less than or equal to maximum password length.
                    </p>
                  </div>

                  {/* Inputs for complex password */}
                  <div className="space-y-0">
                    {[
                      { 
                        label: "Minimum number of Uppercase characters", 
                        field: "minUppercase", 
                        defaultValue: 0,
                        min: 0,
                        max: 20
                      },
                      { 
                        label: "Minimum number of Lowercase characters", 
                        field: "minLowercase", 
                        defaultValue: 0,
                        min: 0,
                        max: 20
                      },
                      { 
                        label: "Minimum number of Numeric characters", 
                        field: "minNumeric", 
                        defaultValue: 0,
                        min: 0,
                        max: 20
                      },
                      { 
                        label: "Minimum number of Special characters", 
                        field: "minSpecial", 
                        defaultValue: 0,
                        min: 0,
                        max: 20
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col mb-4">
                        <label className="text-[#405f7d] text-[12px] mb-1 font-semibold font-roboto">
                          {item.label}
                        </label>
                        <div className="w-60"> {/* Increased width */}
                          <AnimatedInput
                            type="number"
                            value={values[item.field]}
                            onChange={(e) => handleValueChange(item.field, e.target.value)}
                            min={item.min}
                            max={item.max}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}