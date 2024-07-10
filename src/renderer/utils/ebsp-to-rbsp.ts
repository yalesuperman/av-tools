  /**
 * 将ebsp数据转换成rbsp数据
 */
export function ebsp2Rbsp (ebsp: number[]) {
  if (!ebsp) return [];
  const tempRbspData = [];
  let i = 0;
  while(i + 2 < ebsp.length) {
    if ( ebsp[i] === 0x00 &&  ebsp[i + 1] === 0x00 &&  ebsp[i + 2] === 0x03) {
      tempRbspData.push(ebsp[i++]);
      tempRbspData.push(ebsp[i++]);
      i++; // remove emulation_prevention_three_byte
    } else tempRbspData.push(ebsp[i++]);
  }
  while (i < ebsp.length) {
  tempRbspData.push(ebsp[i++]);
  }
  return tempRbspData;
}