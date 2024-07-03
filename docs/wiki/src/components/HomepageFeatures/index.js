import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Cost Efficiency',
    // scale: 10.0,
    Svg: require('@site/static/img/lan.svg').default,
    description: (
      <>
        DePHY’s open-source hardware solutions, complemented by SDKs and tools,
        greatly reduces both manufacturing and network messaging costs involved in bridging hardware products to blockchains
      </>
    ),
  },
  {
    title: 'Low Latency',
    Svg: require('@site/static/img/speed.svg').default,
    description: (
      <>
       DePHY’s node synchronization operates at the 500ms level,
       significantly lower than the 10 minutes required by current blockchain systems
      </>
    ),
  },
  {
    title: 'Verifiability',
    Svg: require('@site/static/img/shield.svg').default,
    description: (
      <>
        DePHY utilizes Soulbound Device Identities (DIDs) to ensure secure, tamper-proof hardware, and ZK technology in Oracles,
        to ensure traceable, confidential, and verifiable network messages
      </>
    ),
  }
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={`${styles.features} hero hero--primary`}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
