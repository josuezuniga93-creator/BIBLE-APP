export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] px-4 pb-28 pt-4">
      <div className="mx-auto max-w-[390px]">
        <div className="flex h-[58px] items-center gap-3 rounded-[24px] border border-black/[0.08] bg-white px-3">
          <div className="h-9 w-[86px] rounded-[18px] border border-black/[0.08] bg-[#f1f1ef]" />
          <div className="h-9 w-[58px] rounded-[18px] border border-black/[0.08] bg-[#f1f1ef]" />
          <div className="ml-auto h-9 w-[90px] rounded-[18px] border border-black/[0.08] bg-[#f6f6f4]" />
        </div>
        <div className="pt-[54px] text-center">
          <p className="text-[11px] font-black uppercase text-[#c9a961]">Preparing Scripture</p>
          <h1 className="mt-7 text-[31px] font-black leading-none text-[#0a0a0a]">Scripture is opening</h1>
          <p className="mx-auto mt-7 max-w-[282px] text-[16px] font-medium leading-[1.18] text-[#767676]">
            A calm reader skeleton is getting your passage ready.
          </p>
        </div>
        <div className="mx-auto mt-10 h-[298px] max-w-[326px] rounded-[28px] border border-black/[0.08] bg-white px-[26px] py-[34px]">
          {[254, 218, 254, 218, 254, 218].map((width, index) => (
            <div
              key={index}
              className="mb-[26px] h-[14px] rounded-full bg-[#eeeeea]"
              style={{ width: `${width}px`, maxWidth: "100%" }}
            />
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[286px] rounded-[22px] border border-[#c9a961]/25 bg-[#f4f2ee] px-6 py-5 text-center">
          <p className="text-[12px] font-black text-[#9a7d39]">Last ready passage</p>
          <p className="mt-3 text-[15px] font-bold text-[#0a0a0a]">John 3:16 available from cache</p>
        </div>
      </div>
    </div>
  );
}
