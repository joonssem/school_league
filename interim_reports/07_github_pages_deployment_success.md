# [배포 보고서] GitHub Public 전환 및 GitHub Pages 배포 완료

- **작성일자**: 2026-09-16
- **저장소**: [joonssem/school_league](https://github.com/joonssem/school_league)
- **공개 여부**: **Public (공개 전환 완료)**
- **배포 주소**: [https://joonssem.github.io/school_league/](https://joonssem.github.io/school_league/)
- **작성자**: 리드 사이언티스트 & 테크니컬 오너

---

## 1. 수행 작업 요약

1. **저장소 Public 전환 완료**:
   - `gh repo edit joonssem/school_league --visibility public` 명령을 통해 비공개 저장소를 안전하게 **공개(Public)**로 전환 완료.
2. **코드 커밋 및 원격 저장소 푸시**:
   - 개인정보 배제 설정(`.gitignore`)이 완벽히 적용된 상태에서 `main` 브랜치로 전체 소스코드 업로드 완료.
3. **GitHub Pages 및 자동 배포 워크플로우 활성화**:
   - `.github/workflows/deploy.yml`을 통해 GitHub Actions 기반 자동 빌드 및 배포 파이프라인 가동.
   - 워크플로우 빌드 및 배포 완료 (`Deploy to GitHub Pages`: **SUCCESS**).

---

## 2. 접속 및 운영 안내

- **배포 URL**: 👉 **`https://joonssem.github.io/school_league/`**
- 이제 학교 와이파이, 체육관, 교탁 PC, 전자칠판, 아이패드 어디서나 위 주소로 접속하면 즉시 실행됩니다.
- **아이패드 PWA 등록**: 사파리에서 접속 후 **[공유] → [홈 화면에 추가]**를 하시면 주소창 없는 독립 앱으로 설치됩니다.
