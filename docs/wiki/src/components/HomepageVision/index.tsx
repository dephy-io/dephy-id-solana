import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

export default function HomepageVision(): JSX.Element {
    return (
      <section className={styles.vision}>
        <div className="container">
          <div className="row text--center">
            <p className={clsx("text--center", styles.visionText)}>
              DePHY aims to solve the two core problems DePIN builders:
              It is very expensive to build the hardware and
              It is very difficult to connect IoT devices on chain
            </p>

            <p className={clsx("text--center", styles.visionButton)}>
              <Link className={clsx('button button--primary button--lg')} to="docs/quickstart/prerequisites">Quickstart</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }



