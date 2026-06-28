export const TRANSLATIONS = {
  ko: {
    // AppHeader
    title: 'SamsungWalletApp 공통 컴포즈 모듈 사용 현황',
    viewer: '뷰어',
    total_components: '전체 컴포넌트',
    total_references: '총 참조 횟수',

    // Sidebar
    data_source: '데이터 소스',
    daily: '일별',
    weekly: '주간',
    monthly: '월간',
    yearly: '연간',
    report_history: '리포트 이력',
    view_all_history: '전체 이력 보기',
    no_reports_found: '조회된 리포트 내역이 없습니다.',

    // RunCard
    year_suffix: '년',
    week_suffix: '주',
    month_suffix: '월',
    components_label: '컴포넌트',
    references_label: '참조수',

    // TabSwitcher
    tab_overview: '전체 컴포넌트 목록',
    tab_files: '파일별 세부 사용처',
    tab_modules: '모듈별 세부 사용처',

    // OverviewTab / FilterPanel
    search_placeholder: '컴포넌트 또는 파일명 검색...',
    sort_label: '정렬 기준',
    sort_file_asc: '파일 이름 오름차순',
    sort_file_desc: '파일 이름 내림차순',
    sort_name_asc: '컴포넌트 이름 오름차순',
    sort_name_desc: '컴포넌트 이름 내림차순',
    sort_count_desc: '참조 많은순',
    sort_count_asc: '참조 적은순',

    // OverviewTab / ComponentsGrid
    no_components_matched: '조건에 맞는 컴포넌트가 없습니다.',
    component_count: '컴포넌트 {count}개',
    total_refs_count: '총 참조 {count}회',
    refs_count_label: '참조 수',
    refs_count_suffix: '회',

    // FilesTab / index
    no_file_details: '조회 가능한 세부 파일 정보가 없습니다.',
    no_module_details: '조회 가능한 세부 모듈 정보가 없습니다.',

    // FilesTab / FileMenuList
    component_source_files: '컴포넌트 소스 파일',

    // FilesTab / FileDetailPanel
    load_file_error: '파일 정보 로드 실패',
    select_file_placeholder: '파일을 선택하세요.',
    package_label: '패키지',
    ref_count_label: '참조 횟수',
    ref_count_suffix_times: '회',
    called_classes_label: '호출 클래스 / 파일 위치',
    unused_component_msg: '이 공통 컴포넌트는 프로젝트 내에서 호출된 이력이 없습니다.',
    line_label: '라인',
    refs_suffix: '회 참조',

    // AllHistoryMatrix
    file_name: '파일명',
    component_name: '컴포넌트명',
    subtotal: '합계',
    total_use_ref_count: '총 사용 참조 횟수',
    file_subtotal: '파일 합계',
    matrix_loading: '이력 매트릭스 데이터 로딩 중...',
    matrix_error: '데이터를 가져오는데 실패했습니다.',
    mode_component: '컴포넌트별',
    mode_module: '모듈별',
    col_module_name: '모듈명',

    // Error messages & fallback
    fetch_failed: '파일을 불러오는데 실패했습니다',
    cors_warning: '로컬 파일 프로토콜(file://) 환경에서는 CORS 제한으로 데이터를 불러올 수 없습니다.\n터미널에서 python -m http.server 8000 실행 후 http://localhost:8000 에 접속하세요.',
  },
  en: {
    // AppHeader
    title: 'SamsungWalletApp Common Compose Components Usage',
    viewer: 'Viewer',
    total_components: 'Total Components',
    total_references: 'Total References',

    // Sidebar
    data_source: 'Data Source',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    report_history: 'Report History',
    view_all_history: 'View All History',
    no_reports_found: 'No reports found.',

    // RunCard
    year_suffix: 'Y',
    week_suffix: 'W',
    month_suffix: 'M',
    components_label: 'Comps',
    references_label: 'Refs',

    // TabSwitcher
    tab_overview: 'Component List',
    tab_files: 'File Details',
    tab_modules: 'Module Details',

    // OverviewTab / FilterPanel
    search_placeholder: 'Search component or file...',
    sort_label: 'Sort by',
    sort_file_asc: 'File Name (A-Z)',
    sort_file_desc: 'File Name (Z-A)',
    sort_name_asc: 'Component Name (A-Z)',
    sort_name_desc: 'Component Name (Z-A)',
    sort_count_desc: 'Most Referenced',
    sort_count_asc: 'Least Referenced',

    // OverviewTab / ComponentsGrid
    no_components_matched: 'No components matched.',
    component_count: '{count} component(s)',
    total_refs_count: 'Total {count} ref(s)',
    refs_count_label: 'References',
    refs_count_suffix: '',

    // FilesTab / index
    no_file_details: 'No file details found.',
    no_module_details: 'No module details found.',

    // FilesTab / FileMenuList
    component_source_files: 'Component Source Files',

    // FilesTab / FileDetailPanel
    load_file_error: 'Failed to load file details',
    select_file_placeholder: 'Select a file to view details.',
    package_label: 'Package',
    ref_count_label: 'References',
    ref_count_suffix_times: '',
    called_classes_label: 'Calling Classes / Locations',
    unused_component_msg: 'This component is not referenced anywhere in the project.',
    line_label: 'Line',
    refs_suffix: ' ref(s)',

    // AllHistoryMatrix
    file_name: 'File Name',
    component_name: 'Component Name',
    subtotal: 'Total',
    total_use_ref_count: 'Total Reference Count',
    file_subtotal: 'File Total',
    matrix_loading: 'Loading history matrix data...',
    matrix_error: 'Failed to load data.',
    mode_component: 'By Component',
    mode_module: 'By Module',
    col_module_name: 'Module Name',

    // Error messages & fallback
    fetch_failed: 'Failed to load file',
    cors_warning: 'CORS restrictions prevent loading data under the local file protocol (file://).\nPlease run "python -m http.server 8000" and visit http://localhost:8000.',
  }
};
