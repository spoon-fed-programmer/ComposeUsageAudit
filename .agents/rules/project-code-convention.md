# 🚀 Compose Component Usage Tracker 코딩 컨벤션

> 본 문서는 `Compose Component Usage Tracker` 프로젝트의 일관된 코드 품질과 아키텍처를 유지하기 위해 개발자 및 AI 에이전트가 반드시 준수해야 하는 코드 작성 규칙입니다.
> 프로젝트는 크게 **Python 정적 분석 엔진**과 **Vite React 기반 웹 리포트 뷰어**로 구분됩니다.

---

## 1. Python 정적 분석 엔진 개발 규칙 (Python Backend Rules)

### 📌 1.1 설정 제어 및 하드코딩 금지 (Configuration Rule)
- 분석 경로, 대상 프로젝트 명, 파일 확장자 등 모든 환경 설정은 루트 디렉토리의 `config.json` 파일로부터 로드해야 합니다.
- 스크립트 코드 내부([tracker.py](./tracker.py))에 절대 경로나 특정 파일 확장자 등을 하드코딩해서는 안 됩니다.

### 📌 1.2 Git 소스 제어 및 안전한 최신화 (Git Sync Policy)
- 스캔 수행 전에 타겟 브랜치(`MAIN_BRANCH`)로 체크아웃하고 `git pull --rebase`를 자동 실행하여 최신 소스를 유지합니다.
- 로컬에 커밋되지 않은 작업이 있어 충돌 위험이 있을 경우, 스크립트가 중단되지 않도록 `git stash` 처리 후 작업을 진행하고 완료 후 되돌리는 등 안전한 예외 처리를 반드시 적용해야 합니다.

### 📌 1.3 정밀한 정적 코드 스캔 규칙 (Strict Parsing Rules)
컴파일이나 빌드 단계를 거치지 않고 소스 텍스트를 파싱하므로 다음 오차 필터링 규칙을 정규식 및 예외 처리를 통해 엄격하게 적용해야 합니다:
- **주석 제외**:
  - 한 줄 주석 (`// ...`), 여러 줄 주석 (`/* ... */`), KDoc 주석 (`/** ... */`) 내의 텍스트 매칭은 참조 횟수 카운트에서 반드시 완전히 제외합니다.
- **임포트(Import) 구문 제외**:
  - 파일 헤드에 포함되는 `import com.common.compose.Button`과 같은 임포트 선언문은 컴포넌트 실사용이 아니므로 참조 카운트에서 제외합니다.
- **단어 경계 매칭**:
  - 컴포넌트명이 다른 문자열의 일부분과 겹치는 경우(예: `Button` 스캔 시 `MyButton`, `ButtonLayout`이 검출되는 것)를 방지하기 위해 정규식의 단어 경계(`\b컴포넌트명\b`) 매칭을 필수 적용합니다.
- **자기 자신 정의 파일 제외**:
  - 공통 컴포넌트가 정의된 파일 자체(예: `Buttons.kt` 내의 `PrimaryButton` 선언) 내에서의 선언/참조는 카운트에서 제외합니다.

### 📌 1.4 단위 테스트 보존 및 작성 규칙 (Testability Policy)
- 파싱 유틸리티 함수나 주석 제거기 등 모든 핵심 스캔 로직은 [test_tracker.py](./test_tracker.py)에 단위 테스트가 구현되어야 합니다.
- 로직 수정 시 반드시 `python -m unittest test_tracker.py`를 실행하여 기존 테스트 케이스를 통과하는지 검증해야 합니다.

---

## 2. 리포트 저장소 및 파일 스펙 규칙 (CSV Report Specification)

- **출력 경로**: 실행 시마다 `reports/YYYYMMDD_HHMMSS/` 디렉토리를 생성하여 누적 저장합니다.
- **`summary.csv` 스펙**:
  - 전체 통계 메트릭(Project Name, Generated Date, Total Components, Active Components, Unused Components, Total References)을 상단에 기록하고, 하단에 전체 컴포넌트 사용 빈도 목록을 **파일명 오름차순(1순위)**, **컴포넌트명 오름차순(2순위)**으로 정렬하여 작성합니다.
- **개별 컴포넌트 CSV 스펙**:
  - 컴포넌트 소스 파일 단위로 `<ComponentFileName>.csv`를 생성하며, 패키지 정보, 파일명, 컴포넌트별 참조 횟수와 상세 호출 클래스 목록을 명시합니다.

---

## 3. React 뷰어 개발 규칙 (React Viewer Rules)

### 📌 3.1 컴포넌트 모듈화 및 스타일 (Component & Scoped CSS Rules)
- 모든 UI 컴포넌트는 단일 책임 원칙을 따르며, [viewer/src/components/](./viewer/src/components) 폴더 하위에서 도메인 및 기능별로 모듈화하여 관리합니다.
- Tailwind CSS를 사용하되 임의의 색상 코드나 매직 넘버 사용을 금지하며, `tailwind.config.js`에 정의된 색상 테마 및 컴포넌트 변수를 준수합니다.

### 📌 3.2 다국어(i18n) 지원 규칙 (Localization Rules)
- 뷰어 UI에 노출되는 모든 화면 텍스트(한국어/영어)는 컴포넌트 코드 내에 하드코딩해서는 안 됩니다.
- 반드시 [viewer/src/utils/i18n.js](./viewer/src/utils/i18n.js)의 `TRANSLATIONS` 객체 내에 키-값 쌍으로 추가해야 합니다.
- 컴포넌트에서는 `useI18n()` 훅을 사용하여 다국어 키를 참조해야 합니다.
- **예시**:
  ```jsx
  import { useI18n } from '../contexts/I18nContext';

  export default function MyComponent() {
    const { t } = useI18n();
    return <div>{t('my_translation_key')}</div>;
  }
  ```

### 📌 3.3 클라이언트 사이드 CSV 파싱 및 상태 관리
- 백엔드 서버 없이 동작하는 100% 정적 뷰어이므로, 데이터 로드 및 파싱은 [viewer/src/utils/csvParser.js](./viewer/src/utils/csvParser.js) 및 custom hook인 [viewer/src/hooks/useFileCsv.js](./viewer/src/hooks/useFileCsv.js) 등을 통해 클라이언트 브라우저 단에서 비동기처리하도록 통일합니다.
