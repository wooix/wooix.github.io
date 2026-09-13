export const topicIds = ['llm-trends', 'llm-tech', 'finject', 'alignment', 'steering', 'slm-hardware', 'slm-performance'] as const;
export type TopicId = (typeof topicIds)[number];

export const topics: { id: TopicId; label: string; english: string; description: string; question: string; scopes: string[]; status?: string }[] = [
  { id: 'llm-trends', label: 'LLM 동향', english: 'LLM Trends', description: '모델과 연구의 변화를 따라가며, 새로운 발표를 기존 연구의 맥락에 놓습니다.', question: '언어 모델의 다음 변화는 어디에서 시작될까요?', scopes: ['LLM(Large Language Model, 대규모 언어 모델)의 발전', 'Reasoning(추론)과 Multimodality(멀티모달)', 'AI 연구그룹의 기술 블로그와 공개 보고서'] },
  { id: 'llm-tech', label: 'LLM 기술', english: 'LLM Techniques', description: '언어 모델을 구성하는 원리부터 학습·추론 시스템까지, 기술의 작동 방식을 살펴봅니다.', question: '모델 안에서는 어떤 일이 일어날까요?', scopes: ['Architecture(모델 구조)와 Attention(어텐션)', 'Training(학습)과 Inference(추론 실행)', 'RAG(Retrieval-Augmented Generation, 검색 증강 생성)와 평가'] },
  { id: 'finject', label: 'FInject 후속', english: 'FInject Research', description: '금융 문제의 Unanswerability(답변 불가능성), Robustness(견고성), Evidence Grounding(근거 연결·검증)을 잇는 후속 읽기입니다.', question: '근거가 부족한 금융 질문에 모델은 어떻게 답해야 할까요?', scopes: ['Financial Numerical Reasoning(금융 수치 추론)과 답변 가능성', 'Unanswerability(답변 불가능성)와 Abstention(응답 유보)', 'Evidence Grounding(근거 연결·검증)과 Robustness(견고성) 평가'] },
  { id: 'alignment', label: 'Alignment', english: 'Alignment', description: '모델의 응답을 사람의 의도와 선호에 맞추는 학습 방법과 그 한계를 읽습니다.', question: '사람의 선호를 모델은 어떻게 배울까요?', scopes: ['Alignment(정렬)와 Preference Learning(선호 학습)', 'RLHF(Reinforcement Learning from Human Feedback, 인간 피드백 강화학습)', 'DPO(Direct Preference Optimization, 직접 선호 최적화)와 안전성 평가'] },
  { id: 'steering', label: 'Steering', english: 'Model Steering', description: '모델 내부 표현과 추론 과정을 조정해, 행동과 응답 방향을 바꾸는 방법을 탐구합니다.', question: '학습을 다시 하지 않고 모델의 방향을 바꿀 수 있을까요?', scopes: ['Activation Steering(활성값 조향)', 'Representation Engineering(표현 공학)', 'Mechanistic Interpretability(기계적 해석 가능성)와 제어의 한계'] },
  { id: 'slm-hardware', label: 'SLM 하드웨어', english: 'SLM on Hardware', description: '작은 언어 모델을 실제 장치에서 구동하기 위한 메모리, 연산, 배포 지식을 쌓습니다.', question: '내 장치에서 모델을 돌리려면 무엇이 필요할까요?', scopes: ['SLM(Small Language Model, 소형 언어 모델)의 On-device Inference(기기 내 추론)', 'Quantization(양자화)와 Memory Bandwidth(메모리 대역폭)', 'CPU·GPU·NPU의 실행 특성과 성능 측정'] },
  { id: 'slm-performance', label: 'SLM 성능', english: 'SLM Performance', description: '모델의 크기가 작아도 더 잘 추론하고 학습하도록 만드는 연구를 읽습니다.', question: '작은 모델은 어떻게 더 깊이 생각할까요?', scopes: ['Knowledge Distillation(지식 증류)', 'Data Quality(데이터 품질)와 Post-training(사후 학습)', 'Reasoning(추론) 성능과 Efficiency(효율)의 균형'] },
];

export const getTopic = (id: TopicId) => topics.find((topic) => topic.id === id)!;
export const kindLabels = { milestone: 'Milestone(이정표 논문)', 'research-note': 'Research Note(연구 노트)', 'research-review': 'Paper Review(논문 리뷰)' };
