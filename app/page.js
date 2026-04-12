"use client";

import Link from "next/link";
import { FiActivity, FiFileText, FiCalendar, FiTarget, FiAward } from "react-icons/fi";
import { FiMessageSquare, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { FiZap, FiCheck, FiTarget as FiIcon } from "react-icons/fi";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className={styles.bgPattern} />
      
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            Now with AI-powered insights
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleWord}>Your</span>
            <span className={styles.titleWord}>academic</span>
            <span className={styles.titleWord}>sidekick</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Get instant answers about attendance, assignments, schedules & more.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth?mode=signup" className="button-primary">
              Get Started <FiArrowRight className={styles.btnIcon} />
            </Link>
            <Link href="/auth?mode=login" className="button-secondary">
              Sign In
            </Link>
          </div>
          
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Students</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Queries</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99%</span>
              <span className={styles.statLabel}>Accuracy</span>
            </div>
          </div>
        </div>
        
        <div className={styles.middleColumn}>
          <Link href="/chat" className={styles.middleCard}>
            <div className={styles.middleCardIcon}>
              <FiMessageSquare />
            </div>
            <div className={styles.middleCardContent}>
              <span className={styles.middleCardTitle}>Student Assistant</span>
              <span className={styles.middleCardDesc}>Ask anything about your academics</span>
            </div>
            <FiArrowRight className={styles.middleCardArrow} />
          </Link>
          
          <Link href="/dashboard" className={styles.middleCard}>
            <div className={styles.middleCardIcon}>
              <FiTrendingUp />
            </div>
            <div className={styles.middleCardContent}>
              <span className={styles.middleCardTitle}>Demo Readiness</span>
              <span className={styles.middleCardDesc}>Verify records before demos</span>
            </div>
            <FiArrowRight className={styles.middleCardArrow} />
          </Link>
          
          <div className={styles.middleFeature}>
            <div className={styles.middleFeatureIcon}>
              <FiZap />
            </div>
            <span className={styles.middleFeatureTitle}>Instant Answers</span>
          </div>
          
          <div className={styles.middleFeature}>
            <div className={styles.middleFeatureIcon}>
              <FiCheck />
            </div>
            <span className={styles.middleFeatureTitle}>Verified Data</span>
          </div>
          
          <div className={styles.middleFeature}>
            <div className={styles.middleFeatureIcon}>
              <FiIcon />
            </div>
            <span className={styles.middleFeatureTitle}>Clear Actions</span>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.glowOrb} />
          <div className={styles.floatingCard1}>
            <div className={styles.cardAccent} />
            <FiActivity className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>Attendance</span>
              <span className={styles.cardSub}>98% this month</span>
            </div>
          </div>
          <div className={styles.floatingCard2}>
            <div className={styles.cardAccent} />
            <FiFileText className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>Assignments</span>
              <span className={styles.cardSub}>3 pending</span>
            </div>
          </div>
          <div className={styles.floatingCard3}>
            <div className={styles.cardAccent} />
            <FiCalendar className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>Schedule</span>
              <span className={styles.cardSub}>5 classes today</span>
            </div>
          </div>
          <div className={styles.floatingCard4}>
            <div className={styles.cardAccent} />
            <FiTarget className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardTitle}>Progress</span>
              <span className={styles.cardSub}>On track</span>
            </div>
          </div>
          <div className={styles.floatingCard5}>
            <FiAward className={styles.cardIcon} />
            <span className={styles.cardText}>Top scorer</span>
          </div>
        </div>
      </section>
    </main>
  );
}