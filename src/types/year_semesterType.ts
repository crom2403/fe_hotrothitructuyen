export interface Year {
  id: string;
  code: string;
  start_year: number;
  end_year: number;
  is_current: boolean;
}

export interface YearForm {
  start_year: number;
  end_year: number;
}

export interface Semester {
  id: string;
  name: string;
  code: string;
  year_name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface SemesterForm {
  name: string;
  code: string;
  year: string;
  start_date: Date;
  end_date: Date;
}