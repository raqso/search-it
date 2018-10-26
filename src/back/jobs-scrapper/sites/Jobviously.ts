import { GetData } from '../GetData';

export default class Jobviously implements Site {
  name = '<jobvious/y>';
  address = 'https://jobviously.pl';
  endpointAddress = 'https://jobviously.pl/api/offers?count=all&type=all&page=';

    async getJobs() {
    let jobOffers: Job[] = [];
    let lastPage = false;

    for (let page = 0; !lastPage; page++) {
      let jobs: JobviouslyResponse = await this.downloadOffers(page); // @TODO Extract to a function in GetData

      if (!jobs || jobs && jobs.count === 0) {
          lastPage = true;
      }
      else if (jobs.offers && Array.isArray(jobs.offers)) {
        jobs.offers.forEach(job => {
          jobOffers.push(this.createJobOffer(job));
        });
      }
    }
    return jobOffers;
  }

    private async downloadOffers(page: number) {
        let jobs: JobviouslyResponse = await GetData.getRequest(this.endpointAddress + page);
        jobs = jobs && typeof jobs === 'string' ? JSON.parse(jobs) : []; // @TODO Extract to a function in GetData
        return jobs;
    }

  private createJobOffer(job: Offer): Job {
    return {
      addedDate: this.getOfferDate(job.created),
      company: job.name ? job.name : '',
      companyLogo: job.logo && job.logo.url ? this.address + job.logo.url : '',
      dateCrawled: new Date(),
      link: this.generateOfferLink(job.id, job.slug),
      location: job.address ? job.address.city : '',
      position: job.position,
      salaryRange: {
        from: job.salary_from,
        to: job.salary_to,
        currency: ''
      },
      technology: this.getTechnologiesArray(job.technologies),
      website: this.name
    };
  }

  private generateOfferLink(offerId: number, slug: string) {
      if (offerId && slug) {
          return `${this.address}/offers/${offerId}/${slug}`;
      }
      else {
          return '';
      }
  }

  private getTechnologiesArray(skills: Technology[]) {
    let technologies: string[] = [];
    skills.forEach(skill => {
      if (skill.name) {
        technologies.push(skill.name);
      }
    });
    return technologies;
  }

  private getOfferDate(created: Offer['created']) {
    const howMany = Number( created.split(' ')[0] );
    const unit: 'hours' | 'days' | 'weeks' | string = created.split(' ')[1];
    let todayDate = new Date();

    switch (unit) {
        case 'hour':
        case 'hours': {
            todayDate.setHours(todayDate.getHours() - howMany);
            return todayDate;
            break;
         }
         case 'day':
         case 'days': {
            todayDate.setDate(todayDate.getDate() - howMany);
            return todayDate;
            break;
         }
         case 'week':
         case 'weeks': {
            todayDate.setDate( todayDate.getDate() - (howMany * 7) );
            return todayDate;
            break;
         }
         default: {
            return null;
            break;
         }
    }
  }
}

export interface JobviouslyResponse {
  total_count?: number;
  page?: number;
  count?: number;
  count_per_page?: number;
  offers?: Offer[];
}

export interface Offer {
  id: number;
  offer_accepted: boolean;
  type: Type;
  created: string;
  expired: boolean;
  timestamp: number;
  isNew: boolean;
  position: string;
  salary_from: number;
  salary_to: number;
  slug: string;
  employee?: null;
  address: Address;
  technologies: Technology[];
  foreignLanguages: ForeignLanguage[];
  categories: Category[];
  employeeLevels: Category[];
  employmentTypes: Category[];
  workForms: Category[];
  name: string;
  logo: Logo | null;
  company?: Company | null;
}

export interface Address {
  country: Country;
  city: string;
  district: string;
  street: string;
  lat: number;
  lng: number;
}

export enum Country {
  Poland = 'Poland',
  Polska = 'Polska'
}

export interface Category {
  name: Name;
}

export enum Name {
  B2B = 'B2B',
  BackEnd = 'Back-end',
  DevOps = 'DevOps',
  FrontEnd = 'Front-end',
  Fullstack = 'Fullstack',
  GraphicsDesign = 'Graphics/Design',
  InHouse = 'in house',
  Junior = 'junior',
  Middle = 'middle',
  Mobile = 'Mobile',
  NameOther = 'other',
  Other = 'Other',
  PartRemote = 'part-remote',
  Permanent = 'permanent',
  Remote = 'remote',
  Senior = 'senior',
  Support = 'Support',
  Testing = 'Testing'
}

export interface Company {
  id: number;
  name: string;
  logo: Logo | null;
  site: null | string;
  phone: null | string;
  email: string;
  description: null | string;
  team: null | string;
}

export interface Logo {
  id: number;
  title: null;
  description: null;
  url: string;
  relative: string;
  width: number;
  height: number;
  focal_x: number;
  focal_y: number;
}

export interface ForeignLanguage {
  name: string;
  level: number;
}

export interface Technology {
  name: string;
  filters: number;
  level: number;
}

export enum Type {
  Employee = 'employee',
  Job = 'job'
}