# Compose Component Usage Tracker

이 도구는 대규모 안드로이드 프로젝트 내에서 공통 컴포넌트의 사용량과 기여도를 정량적으로 분석하는 **정적 코드 분석 도구**입니다.

## 주요 기능

1. **환경 설정 제어 (`config.json`):** 하드코딩 없이 외부 설정 파일을 통해 대상 프로젝트명, 경로, 공통 compose 패키지 경로, 스캔할 파일 확장자 등을 설정합니다.
2. **Git 소스 자동 최신화:** 분석 전 target 안드로이드 프로젝트 저장소에서 `git checkout <branch>` 및 `git pull --rebase` 명령을 자동 실행하여 항상 최신 소스 코드를 기준으로 스캔합니다. (로컬에 커밋되지 않은 작업이 있을 시 자동 `git stash` 처리로 충돌 방지)
3. **정밀한 정적 분석 (주석 및 임포트 제외):**
   - 한 줄 주석(`//`), 여러 줄 주석(`/* ... */`), KDoc 주석(`/** ... */`) 내의 텍스트는 분석에서 완전히 제외합니다.
   - 단순 임포트문(`import com.common.compose.Button`)은 참조 카운트에 포함하지 않습니다.
   - 단어 경계(Word Boundary) 매칭(`\b컴포넌트명\b`)을 적용하여 이름 일부분이 겹치는 컴포넌트(예: `Button` vs `MyCustomButton`)의 오차를 방지합니다.
   - 컴포넌트가 정의된 파일 자신은 참조 카운트에서 제외합니다.
4. **리포트 저장:** 매 실행마다 `YYYYMMDD_HHMMSS.csv` 형태의 누적 보고서를 생성합니다. 파일 상단에는 프로젝트 요약(Summary) 정보를 담고, 하단에는 개별 컴포넌트의 상세 사용 내역(Raw Data)을 기록합니다.

## 설치 및 요구사항

- Python 3.x 이상
- Git CLI (시스템 PATH에 등록되어 있어야 함)

## 사용 방법

1. **설정 파일 작성:**
   프로젝트 루트 디렉토리에 `config.json` 파일을 생성하고 분석 대상을 지정합니다.
   ```json
   {
     "PROJECT_NAME": "MyAndroidProject",
     "PROJECT_PATH": "C:/path/to/android/project",
     "TARGET_PACKAGE_PATH": "C:/path/to/android/project/common/aar/compose",
     "TARGET_EXTENSIONS": ["kt", "kts"],
     "MAIN_BRANCH": "main",
     "OUTPUT_DIR": "./reports"
   }
   ```
   * `OUTPUT_DIR`: 결과 CSV 리포트가 생성될 목적지 디렉토리 경로 (생략 시 기본값 `"."` 적용으로 현재 실행 디렉토리에 생성)

2. **도구 실행:**
   ```bash
   python tracker.py
   ```

3. **결과 확인:**
   실행이 완료되면 설정된 `OUTPUT_DIR` 경로(기본 설정: `reports/` 폴더)에 `YYYYMMDD_HHMMSS` 형식의 디렉토리가 생성되고, 그 하위에 다중 CSV 파일들이 저장됩니다.
   
   **생성 디렉토리 구조:**
   ```text
   reports/
   └── YYYYMMDD_HHMMSS/
       ├── summary.csv
       ├── Buttons.csv
       ├── Inputs.csv
       └── Cards.csv (기타 컴포넌트 소스 파일들...)
   ```

   * **`summary.csv` 내부 구조:**
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
     Inputs.kt,TextInput,12
     ...
     ```

   * **개별 컴포넌트 CSV 내부 구조 (예: `Buttons.csv`):**
     ```csv
     Package,com.common.compose.button
     File,Buttons.kt

     Component,PrimaryButton
     Reference Count,8
     Referenced Class
     com.domain.auth.LoginActivity
     com.domain.auth.RegisterActivity
     ...
     ```

## 리포트 뷰어 (Report Viewer)

도구 실행 후 생성된 리포트 파일들을 편리하게 조회하고 검색할 수 있도록 해주는 웹 기반의 **100% 정적 리포트 뷰어**가 내장되어 있습니다.

* **동작 원리:** 백엔드 연동 없이 브라우저 단에서 직접 `./reports/latest_reports.json` 및 개별 CSV 파일을 비동기로 가져와 동적으로 파싱하고 렌더링합니다. (GitHub Pages에 프로젝트 그대로 업로드하여 호스팅하기 매우 적합합니다.)
* **사용 방법:** 
  1. 프로젝트 루트의 `index.html` 파일을 더블 클릭하여 브라우저로 엽니다. (혹은 로컬 웹 서버 구동 후 열어도 됩니다.)
  2. 우측 상단의 **데이터 소스** 선택 영역에서 `reports/latest_reports.json`을 기본 로드하며, 다른 형태의 리포트 JSON 파일이 추가 생성된 경우 `직접 입력...`을 선택하여 원하는 JSON 파일 경로(예: `reports/monthly_reports.json`)를 입력하고 로드할 수 있습니다.
  3. 좌측 사이드바에서 원하는 리포트 이력을 클릭하면, 메인 화면에 컴포넌트별 사용 통계와 파일별 상세 클래스 호출 위치가 실시간으로 렌더링됩니다.

## 테스트 코드 실행

구현된 핵심 파서와 유틸리티의 동작은 다음 명령어로 검증할 수 있습니다:
```bash
python -m unittest test_tracker.py
```
