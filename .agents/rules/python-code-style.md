# 🚀 Python Antigravity Rules

> 소프트웨어의 복잡성(중력)을 거스르고, 항상 가볍고 유지보수하기 쉬운 상태를 유지하기 위한 Python 개발 원칙입니다. **PEP 8 표준**, **엄격한 모듈화**, **타입 안전성**, 그리고 **의존성 격리**를 핵심 가치로 삼습니다.

---

## 1. 모듈 중력 제어 (Single Responsibility & Modularity)
모든 Python 모듈(파일), 클래스, 함수는 단일 책임 원칙(SRP)을 따르며, 하나의 역할에 집중해야 합니다. 코드가 무거워지는 것을 방지하기 위해 크기와 깊이를 제어합니다.

* **함수 및 클래스 크기 제한**
  * 하나의 함수는 최대 **30라인** 이내로 작성하는 것을 권장합니다. 그 이상으로 길어지면 서브 함수로 분리합니다.
  * 하나의 클래스는 **300라인**을 넘기지 않도록 설계합니다.
* **코드 중첩 깊이 제한 (Low Depth)**
  * 조건문, 반복문 등의 중첩(Nesting) 깊이는 **최대 2 depth**를 넘지 않도록 합니다. 
  * `Guard Clause`(빠른 반환) 패턴을 활용하여 들여쓰기 깊이를 낮추고 가독성을 높입니다.
  * *Bad*:
    ```python
    def process_user(user):
        if user is not None:
            if user.is_active:
                if user.has_permission("write"):
                    # 비즈니스 로직 실행 (3 depth)
                    ...
    ```
  * *Good*:
    ```python
    def process_user(user):
        if not user or not user.is_active:
            return
        if not user.has_permission("write"):
            return
        # 비즈니스 로직 실행 (0 depth)
        ...
    ```

---

## 2. 타입 안전성과 자기문서화 (Type Safety & Self-Documenting)
Dynamic Type 언어인 Python의 단점을 보완하고, 코드 자체로 설계 의도가 드러나도록 작성합니다.

* **엄격한 타입 힌팅 (Type Hinting)**
  * 모든 함수의 매개변수와 반환값에는 반드시 명시적인 타입 힌트를 작성합니다.
  * 복잡한 타입은 `typing` 모듈(또는 Python 3.10+의 union 연산자 `|`)을 활용합니다.
  * 가급적 `Any` 사용을 지양하고, 구체적인 타입이나 `Generic`을 사용합니다.
* **Google 스타일 Docstring 준수**
  * Public 함수, 클래스, 모듈에는 Google 스타일의 Docstring을 작성하여 역할과 매개변수, 반환값, 예외를 명시합니다.
  * 예시:
    ```python
    def calculate_discount(price: float, discount_rate: float) -> float:
        """상품의 할인 가격을 계산합니다.

        Args:
            price: 상품의 원가 (양수).
            discount_rate: 할인율 (0.0 ~ 1.0).

        Returns:
            할인이 적용된 최종 가격.

        Raises:
            ValueError: 가격이나 할인율이 범위를 벗어난 경우.
        """
        if price < 0 or not (0.0 <= discount_rate <= 1.0):
            raise ValueError("Invalid price or discount rate")
        return price * (1 - discount_rate)
    ```

---

## 3. 외부 의존성 격리 (Dependency Isolation - Adapter Pattern)
외부 라이브러리(HTTP 클라이언트, 데이터베이스 ORM, 파일 파서 등)나 API 스펙이 비즈니스 도메인 로직에 직접 침투하는 것을 방지합니다.

* **어댑터/래퍼 패턴 활용 (Adapter Pattern)**
  * `requests`, `pandas`, `beautifulsoup4` 등 외부 서드파티 라이브러리를 도메인 컴포넌트 내부에서 직접 호출하지 않습니다.
  * 자체 인터페이스를 가진 추상 클래스나 Wrapper 클래스를 구성하여 의존성을 우회(Dependency Inversion)시킵니다. 라이브러리가 변경되어도 비즈니스 로직은 수정할 필요가 없어야 합니다.
* **환경 변수 및 설정 격리**
  * 하드코딩된 값(Magic Value)을 절대 금지합니다.
  * 설정 정보는 `pydantic-settings` 또는 `.env` 파일을 로드하는 별도의 `config.py`를 통해서만 접근합니다.

---

## 4. 견고한 예외 처리 및 로깅 (Robust Exception Handling & Logging)
예외 상황을 명확하게 전파하고 추적 가능한 상태를 유지합니다.

* **Bare except 사용 금지**
  * 예외 처리 시 `except:` 또는 `except Exception:`과 같이 광범위하게 캐치하는 것을 금지합니다. 반드시 발생 가능한 구체적인 예외 클래스(예: `KeyError`, `ValueError`)를 명시합니다.
* **추적 가능한 구조적 로깅**
  * `print()` 대신 내장 `logging` 모듈 또는 `loguru` 같은 표준 로깅 라이브러리를 사용합니다.
  * 예외 발생 시에는 적절한 에러 메시지와 함께 트레이스백(`logger.exception`)을 남겨 디버깅을 용이하게 합니다.

---

## 5. TDD 및 테스트 용이성 (Testability & Pytest)
테스트하기 쉬운 코드가 좋은 설계의 코드입니다. 순수 함수와 의존성 주입을 통해 테스트 커버리지를 확보합니다.

* **순수 함수(Pure Functions) 지향**
  * 상태를 변경하지 않고 동일한 입력에 대해 항상 동일한 출력을 반환하는 순수 함수를 적극적으로 활용합니다. 순수 함수는 모킹(Mocking) 없이 매우 쉽게 테스트할 수 있습니다.
* **의존성 주입 (Dependency Injection)**
  * 데이터베이스 세션이나 파일 시스템 접근과 같은 외부 I/O는 함수나 클래스의 생성자 인자로 주입받아 테스트 시 Mock 객체로 대체하기 쉽게 설계합니다.
* **pytest 기반 테스트 작성**
  * 모든 핵심 비즈니스 로직은 `pytest`를 기반으로 한 단위 테스트(Unit Test)를 수반해야 합니다.
