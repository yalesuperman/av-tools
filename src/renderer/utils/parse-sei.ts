/**
 * 对类型为SEI的NAL Unit的数据进行解析，解析出字节所表示的含义
 */
import { Property } from '../types/parse-nalu';
import { getNaluCommonStruct } from './parse-nalu-common';
import { bytestream2_get_bytes_left, bytestream2_peek_le_n_bits, bytestream2_peek_byte, bytestream2_get_byte, bytestream2_get_string_n_bits, skip_n_bytes } from './operate-bytes';
import { generateUUID } from './generate-uuid';
import { SEITypes } from '../types/sei-types';

function decode_picture_timing(params: { nalu: number[]; readByteIndex: number; }): Property[] {
  const picture_timing: Property[] = [];
  console.log(params)
  return picture_timing;
}

export function handleSEI(nalu: number[]): Property[] {
  // 从8字节的位置开始读其他的信息，换算成bit位置的话是64
  const params = {
    nalu,
    readByteIndex: 5
  }
  const parseResult: Property[] = [
    ...getNaluCommonStruct(nalu),
  ];

  const sei_data: Property[] = [];

  parseResult.push({
    key: generateUUID(),
    title: 'sei_rbsp',
    startBytes: 5,
    bits: 'N/A',
    children: sei_data,
  });

  const sei_message: Property[] = [];

  sei_data.push({
    key: generateUUID(),
    title: 'sei_message',
    startBytes: 5,
    bits: 'N/A',
    children: sei_message
  });

  const sei_payload: Property[] = [];

  while(bytestream2_get_bytes_left(params) > 2 && bytestream2_peek_le_n_bits(params, 16)) {
    let payloadType = 0;
    let payloadSize = 0;
    
    console.log(bytestream2_peek_byte(params))
    while(bytestream2_peek_byte(params) === 255) {
      payloadType += bytestream2_get_byte(params, '').value as number;
    }

    payloadType += bytestream2_get_byte(params, '').value as number;

    while(bytestream2_peek_byte(params) === 255) {
      payloadSize += bytestream2_get_byte(params, '').value as number;
    }

    payloadSize += bytestream2_get_byte(params, '').value as number;

    if (payloadType !== 5) {
      console.log(payloadType, 'type')
    }

    if (payloadType === 5) {
      sei_message.push({
        key: generateUUID(),
        title: 'payloadType',
        startBytes: 5,
        bits: 0,
        value: payloadType,
      });
      sei_message.push({
        key: generateUUID(),
        title: 'payloadSize',
        startBytes: 5,
        bits: 0,
        value: payloadSize,
      });

      sei_message.push({
        key: generateUUID(),
        title: 'sei_payload',
        startBytes: 5,
        bits: 'N/A',
        children: sei_payload
      });

      sei_payload.push(bytestream2_get_string_n_bits(params, 128, 'uuid_iso_iec_11578'));
      sei_payload.push({
        key: generateUUID(),
        title: 'user_data_payload_byte[ ]',
        startBytes: 5,
        bits: 'N/A',
      });
    }

    // TODO 后续再完善
    switch(payloadType) {
      case SEITypes.SEI_TYPE_PIC_TIMING:
        decode_picture_timing(params);
        break;
      default:
        console.log(12312323);
    }

    skip_n_bytes(params, payloadSize);

  }

  return parseResult;
}