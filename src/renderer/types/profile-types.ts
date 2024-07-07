export enum ProfileTypes {
  'High profile' = 100,
  'High10 profile' = 110,
  'High422 profile' = 122,
  'High444 Predictive profile' = 244,
  'Cavlc444 profile' = 44,
  'Scalable Constrained High profile (SVC)' = 83,
  'Scalable High Intra profile (SVC)' = 86,
  'Stereo High profile (MVC)' = 118,
  'Multiview High profile (MVC)' = 128,
  'Multiview Depth High profile (MVCD)' = 138,
  'old High444 profile' = 144,
}

export const profileTypesMap = {
  100: 'High profile',
  110: 'High10 profile',
  122: 'High422 profile',
  244: 'High444 Predictive profile',
   44: 'Cavlc444 profile',
   83: 'Scalable Constrained High profile (SVC)',
   86: 'Scalable High Intra profile (SVC)',
  118: 'Stereo High profile (MVC)',
  128: 'Multiview High profile (MVC)',
  138: 'Multiview Depth High profile (MVCD)',
  144: 'old High444 profile',
}