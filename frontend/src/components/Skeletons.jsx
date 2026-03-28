import React from 'react';

export const RFQCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-16 h-5 bg-[#F3F4F6] rounded-full"></div>
        <div className="w-24 h-5 bg-[#EEF2FF] rounded-full"></div>
      </div>
      <div className="w-3/4 h-6 bg-[#E5E7EB] rounded-md mb-2"></div>
      <div className="w-1/2 h-6 bg-[#E5E7EB] rounded-md mb-6"></div>
      
      <div className="space-y-3 mb-6">
        <div className="w-2/3 h-4 bg-[#F3F4F6] rounded-md"></div>
        <div className="w-5/6 h-4 bg-[#F3F4F6] rounded-md"></div>
      </div>
      
      <div className="mt-auto w-full h-11 bg-[#F9FAFB] rounded-xl"></div>
    </div>
  </div>
);

export const BidTableSkeleton = () => (
  <div className="bg-white border border-[#E5E7EB] overflow-hidden rounded-xl shadow-sm animate-pulse">
    <div className="overflow-x-auto">
      <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
        <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <tr>
            {[...Array(8)].map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 bg-[#E5E7EB] rounded-md w-12"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, row) => (
            <tr key={row} className="border-b border-[#E5E7EB]">
              {[...Array(8)].map((_, col) => (
                <td key={col} className="px-6 py-4">
                  <div className="h-4 bg-[#F3F4F6] rounded-md w-16"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const RFQDetailsSkeleton = () => (
  <div className="bg-[#F9FAFB] min-h-screen text-[#111827] animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-32 h-4 bg-[#E5E7EB] rounded-md mb-10"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="w-32 h-4 bg-[#F3F4F6] rounded-md mb-4"></div>
            <div className="w-3/4 h-10 bg-[#E5E7EB] rounded-md mb-6"></div>
            
            <div className="flex justify-between items-center pb-6 border-b border-[#E5E7EB]">
              <div className="flex gap-3">
                <div className="w-20 h-6 bg-[#F3F4F6] rounded-md"></div>
                <div className="w-16 h-6 bg-[#F3F4F6] rounded-md"></div>
              </div>
              <div className="w-32 h-6 bg-[#F3F4F6] rounded-full"></div>
            </div>
            
            <div className="mt-6 border border-[#E5E7EB] bg-white rounded-xl p-6 flex justify-between">
               <div>
                 <div className="w-40 h-4 bg-[#F3F4F6] rounded-md mb-3"></div>
                 <div className="w-32 h-10 bg-[#E5E7EB] rounded-md"></div>
               </div>
               <div className="text-right">
                 <div className="w-16 h-4 bg-[#F3F4F6] rounded-md ml-auto mb-1.5"></div>
                 <div className="w-24 h-5 bg-[#E5E7EB] rounded-md ml-auto"></div>
               </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-32 h-4 bg-[#F3F4F6] rounded-md"></div>
               <div className="flex-1 h-px bg-[#E5E7EB]"></div>
            </div>
            <BidTableSkeleton />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden h-96"></div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden h-64"></div>
        </div>
      </div>
    </div>
  </div>
);
