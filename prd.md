# 제품 요구사항 정의서 (PRD) & 기술 제안서

## 1. 개요 (Overview)
* **제품명:** Compose Component Usage Tracker (공통 컴포넌트 사용량 추적기)
* **대상 시스템:** 수십만 라인 규모의 안드로이드 개발 프로젝트
* **분석 대상:** `common aar` 내의 `compose` 패키지에 속한 공통 컴포넌트들
* **목적:** 대규모 프로젝트 내 공통 컴포넌트의 기여도 및 사용 빈도를 정량적으로 측정하여 코드 리팩토링, 미사용 컴포넌트 제거, 유효성 검증의 근거 데이터로 활용합니다.

---

## 2. 시스템 아키텍처 및 프로세스 흐름

### 2.1 실행 프로세스
1. **환경 로드:** 외부 `config` 파일에서 프로젝트 명 및 타겟 패키지 경로를 읽어옵니다.
2. **소스 최신화:** 분석을 시작하기 전, 타겟 안드로이드 프로젝트 저장소에서 `git pull --rebase` 명령을 실행하여 항상 최신 소스 코드를 유지합니다.
3. **정적 분석 및 추출:** 최신화된 소스에서 패키지 내 컴포넌트 목록과 전체 프로젝트 내 참조 위치를 스캔합니다. (※ 컴파일/빌드 없이 순수 텍스트 정적 스캔 방식 적용)
4. **리포트 저장:** 요약 정보(Summary)와 상세 정보(Raw Data)가 결합된 `YYYYMMDD_HHMMSS.csv` 파일을 생성합니다.

---

## 3. 핵심 기능 요구사항 (Functional Requirements)

### 3.1 환경 설정 제어 (`config` 파일 기반)
* 유지보수 편의성을 위해 하드코딩을 배제하고, 별도의 설정 파일(예: `config.json`)을 통해 동적으로 프로젝트 환경을 입력받습니다.
* **필수 입력 항목:**
  * `PROJECT_NAME`: 안드로이드 프로젝트 이름
  * `PROJECT_PATH`: 로컬 또는 서버 내 프로젝트 루트 디렉토리 경로
  * `TARGET_PACKAGE_PATH`: 분석 대상이 되는 공통 compose 패키지 경로 (`common/aar/.../compose`)
  * `TARGET_EXTENSIONS`: 스캔할 파일 확장자 목록 (기본값: `["kt", "kts"]`)

### 3.2 Git 레포지토리 최신화 자동화
* 정확한 데이터 산출을 위해 코드 스캔 직전 Git 명령어를 자동 실행하는 프로세스를 포함해야 합니다.
* **수행 명령어:** `git checkout <main_branch>` -> `git pull --rebase`
* **예외 처리:** 로컬에 커밋되지 않은 작업 내용(Stash가 필요한 변경사항)이 있을 경우, 스크립트가 충돌로 인해 중단되지 않도록 경고 메시지를 출력하거나 자동으로 `git stash` 처리 후 진행하는 방어 로직을 구현합니다.

### 3.3 정적 코드 분석 및 데이터 추출 예외 규칙 (필수)
컴파일 없이 텍스트 검색을 기반으로 하므로, 데이터의 오차를 줄이기 위해 다음 **필터링 및 예외 처리 규칙**을 엄격히 적용합니다.

* **주석 처리 코드 제외:** * 한 줄 주석(`// PrimaryButton()`) 내부에서 컴포넌트명이 발견되는 경우 카운트에서 제외합니다.
  * 여러 줄 주석(`/* ... PrimaryButton() ... */`) 및 KDoc 주석(`/** ... */`) 내부에 포함된 문자열 역시 검색 및 카운트 대상에서 완전히 배제합니다.
* **단순 임포트(Import)문 제외:** 파일 상단의 패키지 정의 및 임포트 구문(`import com.common.compose.PrimaryButton`)은 실제 사용이 아니므로 카운트하지 않습니다.
* **단어 경계(Word Boundary) 매칭:** 컴포넌트명이 `Button`일 때, `MyCustomButton`이나 `ButtonLayout`처럼 단어의 일부로 매칭되는 오차를 방지하기 위해 독립된 단어(예: 정규식의 `\b컴포넌트명\b`) 형태로만 매칭을 인정합니다.

### 3.4 디렉토리 기반의 다중 CSV 리포트 생성
* **디렉토리명 포맷:** `YYYYMMDD_HHMMSS` (배치 실행 시마다 고유한 디렉토리를 생성하여 누적 저장)
* **디렉토리 내부 구조:** 
  1. `summary.csv`: 전체 프로젝트 요약 통계를 저장하는 단일 CSV 파일
  2. `<ComponentFileName>.csv`: 공통 컴포넌트의 소스 파일(예: `Buttons.kt` -> `Buttons.csv`) 단위로 생성되는 세부 사용처 정보 CSV 파일 (참조 위치를 행 단위로 나열)

* **파일별 스펙:**

**`summary.csv` 스펙**
* 파일 하단에 모든 공통 컴포넌트 목록을 플랫 테이블 형태로 나열하며, 정렬 기준은 **파일명 오름차순(1순위)**, **동일 파일명 내 컴포넌트명 오름차순(2순위)**을 따릅니다.
```csv
Metric,Value
Project Name,MyAndroidProject
Generated Date,2026-06-27 19:22:00
Total Components,250
Active Components,180
Unused Components,70
Total References,1450

File,Component,Reference Count
Buttons.kt,PrimaryButton,45
Buttons.kt,SecondaryButton,1
Inputs.kt,TextInput,12
...
```

**`<ComponentFileName>.csv` 스펙 (예: `Buttons.csv`)**
```csv
Package,com.common.compose.button
File,Buttons.kt

Component,PrimaryButton
Reference Count,8
Referenced Class
com.domain.auth.LoginActivity
com.domain.auth.RegisterActivity
...

Component,SecondaryButton
Reference Count,1
Referenced Class
com.domain.profile.ProfileActivity
```