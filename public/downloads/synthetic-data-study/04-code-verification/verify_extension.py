"""강의용 수작업 예제. LLM 출력이나 벤치마크 재현이 아닙니다."""
import json
import platform


def correct(has_reservation, extensions):
    return (not has_reservation) and extensions == 0


def ignores_reservation(has_reservation, extensions):
    return extensions == 0


def allows_second_extension(has_reservation, extensions):
    return (not has_reservation) and extensions <= 1


def uses_or(has_reservation, extensions):
    return (not has_reservation) or extensions == 0


# 유효 입력만 검사: has_reservation은 bool, extensions는 0 이상의 int.
# 기대값은 후보 코드의 출력을 복사하지 않고 명세에서 직접 작성했습니다.
weak_tests = [(False, 0, True), (True, 1, False)]
expanded_tests = [
    (False, 0, True), (False, 1, False), (False, 2, False),
    (True, 0, False), (True, 1, False), (True, 2, False),
]
candidates = {
    "correct": correct,
    "ignores_reservation": ignores_reservation,
    "allows_second_extension": allows_second_extension,
    "uses_or": uses_or,
}


def evaluate(function, cases):
    failures = []
    for reserved, count, expected in cases:
        actual = function(reserved, count)
        if actual is not expected:
            failures.append({"input": [reserved, count],
                             "expected": expected, "actual": actual})
    return {"passed": not failures, "failures": failures}


if __name__ == "__main__":
    report = {"example_version": "extension-v1",
              "python": platform.python_version(),
              "provenance": "human_authored_teaching_example",
              "results": {name: {"weak": evaluate(fn, weak_tests),
                                  "expanded": evaluate(fn, expanded_tests)}
                          for name, fn in candidates.items()}}
    print(json.dumps(report, ensure_ascii=False, indent=2))
