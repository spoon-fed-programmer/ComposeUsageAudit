# 제품 요구사항 정의서 (PRD) & 기술 사양서

## 1. 개요 (Overview)
* **제품명:** Compose Component Usage Tracker (공통 컴포넌트 사용량 추적기)
* **대상 시스템:** 수십만 라인 규모의 안드로이드 개발 프로젝트
* **분석 대상:** `common aar` 내의 `compose` 패키지에 속한 공통 컴포넌트들
* **목적:** 대규모 프로젝트 내 공통 컴포넌트의 기여도 및 사용 빈도를 정량적으로 측정하여 코드 리팩토링, 미사용 컴포넌트 제거, 유효성 검증의 근거 데이터로 활용합니다.

---

## 2. 시스템 아키텍처 및 프로세스 흐름

### 2.1 실행 프로세스
1. **환경 로드:** 외부 `config.json` 파일에서 프로젝트 설정 및 경로를 읽어옵니다.
2. **소스 최신화:** 분석 시작 전, 타겟 안드로이드 프로젝트 저장소에서 현재 브랜치를 식별하고 메인 브랜치로 체크아웃한 후 `git pull --rebase` 명령을 실행하여 최신 소스를 유지합니다.
3. **정적 분석 및 추출:** 최신화된 소스에서 대상 패키지 내 Composable 컴포넌트 정의 목록을 파악하고, 전체 프로젝트 소스 코드에서 해당 컴포넌트의 참조 정보(위치, 라인 넘버, 소스 세트 등)를 스캔합니다. (※ 빌드 없는 순수 텍스트 정적 스캔 방식)
4. **리포트 저장:** 일별(Daily), 주별(Weekly), 월별(Monthly), 년별(Yearly) 주기에 따라 고유 폴더를 생성하여 요약 정보, 컴포넌트 인덱스 및 세부 소스 파일별 사용처 정보가 결합된 다중 **JSON 리포트**를 생성 및 누적 관리합니다.

---

## 3. 핵심 기능 요구사항 (Functional Requirements)

### 3.1 환경 설정 제어 (`config.json` 기반)
* 하드코딩을 배제하고 설정 파일을 통해 프로젝트 환경을 입력받습니다.
* **설정 항목:**
  * `PROJECT_NAME` (필수): 안드로이드 프로젝트 이름
  * `PROJECT_PATH` (필수): 로컬 프로젝트 루트 디렉토리 절대 경로
  * `TARGET_PACKAGE_PATH` (필수): 분석 대상 공통 compose 패키지 디렉토리 절대 경로
  * `TARGET_EXTENSIONS` (선택): 스캔할 소스 파일 확장자 목록 (기본값: `["kt", "kts"]`)
  * `MAIN_BRANCH` (선택): 분석 대상 기준 메인 브랜치명 (기본값: `"main"`)
  * `OUTPUT_DIR` (선택): 리포트가 저장될 출력 디렉토리 경로 (기본값: `"."`)

### 3.2 Git 레포지토리 최신화 자동화 및 예외 처리
* 소스 코드 스캔 전 대상 프로젝트의 Git 상태를 확인하고 최신화합니다.
* **수행 프로세스:**
  1. `git status --porcelain`으로 로컬 변경 사항 여부를 체크합니다.
  2. 로컬에 커밋되지 않은 변경 사항이 존재할 경우, 작업 분실을 방지하기 위해 `git stash save "Temp stash before Compose Component Audit"`를 실행하여 수정 사항을 임시 보관합니다.
  3. 설정된 `MAIN_BRANCH`로 체크아웃(`git checkout`) 후 `git pull --rebase`를 수행합니다.
* **예외 방어 설계:**
  * 저장소에 `.git` 디렉토리가 없거나 Git 명령 수행 중 예외가 발생하더라도 스크립트 실행이 중단되지 않으며, 경고를 표시하고 기존 로컬 코드를 기준으로 정적 분석을 진행합니다.
  * 실행 완료 시점의 현재 브랜치 정보를 수집하여 리포트 메타데이터에 기록합니다.

### 3.3 정적 코드 분석 및 데이터 추출 세부 규칙
컴파일 없는 텍스트 정규식 검색 기반으로 동작하므로, 오차율을 낮추기 위해 엄격한 분석 필터링 규칙을 적용합니다.

* **주석 처리 코드 배제:** 
  * 한 줄 주석(`//`), 블록 주석(`/* ... */`), KDoc 주석(`/** ... */`) 내의 텍스트는 매칭 대상에서 제외합니다. 단, 문자열 리터럴 내부에 작성된 주석 형태의 텍스트는 그대로 유지합니다.
* **임포트(Import) 구문 배제:** 파일 상단의 `import `로 시작하는 라인은 실제 사용이 아니므로 분석에서 배제합니다.
* **동일 파일 정의 배제:** 컴포넌트가 정의된 소스 파일 자체 내에서의 참조 카운트는 기여도 산정에서 제외합니다.
* **단어 경계(Word Boundary) 매칭:** 컴포넌트명 앞뒤로 알파벳, 숫자, 언더바(`_`) 등이 붙어 있는 키워드(예: `MyButton`, `ButtonLayout`)는 매칭하지 않고, 정확히 단어 단위(`\b컴포넌트명\b`)로만 매칭합니다.
* **추출 대상 Composable 필터링:**
  * `@Composable` 어노테이션이 붙은 함수를 수집하되, `private fun`은 수집 대상에서 제외합니다 (`internal` 또는 `public` Composable만 수집).
  * `@Preview` 어노테이션이 함께 적용된 미리보기용 Composable 함수는 분석 대상에서 제외합니다.
  * 어노테이션과 `fun` 키워드 사이에 클래스나 변수 선언 등 문법 구조가 섞이는 오탐 시그니처는 필터링합니다.

### 3.4 다중 주기 기반 JSON 리포트 생성 및 구조
기존의 CSV 단일 출력 방식에서 확장되어, 시간의 흐름에 따른 데이터 추적을 지원하기 위해 다중 주기(Daily, Weekly, Monthly, Yearly) 기반의 **JSON 리포트** 구조를 갖춥니다.

* **결과물 출력 경로:** `{OUTPUT_DIR}/compose_common_component`
* **주기별 디렉토리 및 메타 인덱스 구조:**
  * `summary_daily/[YYYYMMDD]/` (일별 스냅샷)
  * `summary_weekly/[YYYY_Www]/` (주별 스냅샷)
  * `summary_monthly/[YYYY_MM]/` (월별 스냅샷)
  * `summary_yearly/[YYYY]/` (년별 스냅샷)
  * 각 주기별 디렉토리 루트(예: `summary_daily/index.json`)에는 실행되었던 스냅샷 히스토리 목록(`runs`)과 기본 프로젝트 메타데이터가 역순(최신순) 정렬로 누적 관리됩니다. 개별 런(`run`) 기록에는 요약 통계(`summary`) 외에도 각 모듈별로 컴포넌트를 호출한 총 횟수를 집계한 **모듈별 사용 지표(`modules`)**가 추가 항목으로 포함됩니다.

#### 3.4.1 파일별 JSON 상세 스펙

**1) `report.json`**
해당 분석 스냅샷의 메타데이터와 요약 통계를 제공합니다.
```json
{
  "timestamp": "20260627",
  "date": "2026-06-27 19:44:00",
  "project_name": "MyAndroidProject",
  "branch": "main",
  "summary": {
    "total_components": 250,
    "active_components": 180,
    "unused_components": 70,
    "total_references": 1450
  },
  "modules": {
    "app": 1430,
    "features/login": 15,
    "vas/dpaper": 5
  }
}
```

**2) `index.json`**
분석된 모든 공통 컴포넌트 목록을 플랫 테이블 형태로 나열하며, 정렬 기준은 **파일명 오름차순(1순위)**, **동일 파일명 내 컴포넌트명 오름차순(2순위)**을 따릅니다.
```json
[
  {
    "file": "Buttons.kt",
    "name": "PrimaryButton",
    "count": 45
  },
  {
    "file": "Buttons.kt",
    "name": "SecondaryButton",
    "count": 0
  },
  {
    "file": "Inputs.kt",
    "name": "TextInput",
    "count": 12
  }
]
```

**3) `<ComponentFileName>.json` (예: `Buttons.json`)**
각 공통 소스 파일 단위로 생성되는 상세 분석 리포트입니다. 컴포넌트별 참조 횟수 기준 내림차순(1순위), 컴포넌트명 오름차순(2순위)으로 정렬됩니다.
이 리포트는 참조한 클래스 경로뿐 아니라 **어떤 모듈(app, common, vas/dpaper 등)과 소스 세트(main, kr, us 등)**에서 사용되었는지, 그리고 파일 내 **구체적인 라인 번호 리스트(`lines`)**까지 세부적으로 추적하여 나타냅니다.
```json
{
  "package": "com.common.compose.button",
  "file": "Buttons.kt",
  "components": [
    {
      "name": "PrimaryButton",
      "count": 3,
      "classes": [
        {
          "class_name": "com.domain.home.HomeActivity",
          "source_set": "main",
          "module_name": "app",
          "count": 2,
          "lines": [10, 25]
        },
        {
          "class_name": "com.domain.settings.SettingsActivity",
          "source_set": "main",
          "module_name": "app",
          "count": 1,
          "lines": [40]
        }
      ]
    },
    {
      "name": "SecondaryButton",
      "count": 0,
      "classes": []
    }
  ]
}
```

---

## 4. 기타 플랫폼/환경 고려사항
* **터미널 인코딩:** Windows 콘솔 환경 실행 시 한글 깨짐을 방지하기 위해, 실행 직후 OS를 판별하여 터미널 코드페이지를 UTF-8 (`chcp 65001`)로 강제 전환하도록 설계되었습니다.