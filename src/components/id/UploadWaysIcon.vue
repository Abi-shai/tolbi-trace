<template>
  <div class="relative size-full">

    <!-- Excel file (back, rotated) -->
    <div class="absolute flex items-center justify-center left-[12px] size-[52.644px] top-0">
      <div class="flex-none rotate-[23.53deg]">
        <div class="relative size-[40px]">
          <div class="absolute inset-[0_10%]">
            <img :src="excelPage" class="absolute block inset-0 max-w-none size-full" alt="" />
          </div>
          <div class="absolute inset-[37.5%_27.5%_17.5%_27.5%] overflow-clip">
            <div class="absolute" style="height:10.8px;left:0.9px;top:4.5px;width:16.2px">
              <div class="absolute" style="inset:-6.94% -4.63%">
                <img :src="excelIcon" class="block max-w-none size-full" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SHP/GPS file (front) -->
    <div class="absolute left-0 size-[40px] top-[10px]">
      <div class="absolute inset-[0_10%]">
        <img :src="shpPage" class="absolute block inset-0 max-w-none size-full" alt="" />
        <div class="absolute inset-[1.25%_1.56%_70%_62.5%]">
          <div class="absolute" style="inset:0 -6.52% -6.52% 0">
            <img :src="shpEarmark" class="block max-w-none size-full" alt="" />
          </div>
        </div>
        <img
          :src="shpUnion"
          class="absolute -translate-x-1/2"
          style="height:12px;left:calc(50% + 0.5px);top:19px;width:13.2px"
          alt=""
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import excelPage  from '~/assets/images/upload-ways/excel-page.svg'
import excelIcon  from '~/assets/images/upload-ways/excel-icon.svg'
import shpPage    from '~/assets/images/upload-ways/shp-page.svg'
import shpEarmark from '~/assets/images/upload-ways/shp-earmark.svg'
import shpUnion   from '~/assets/images/upload-ways/shp-union.svg'
</script>
