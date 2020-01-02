library(tidyverse)
library(sciplot)
library(cowplot)
library(lme4)
library(here)
theme_set(theme_cowplot())

#current directory
cur_dir <- here()

#folder path separator
path_sep="/"

#read in data
d <- read_csv(paste(cur_dir,"analysis","version1","open_data","CrossSitRepMem_v1_data_cleaned.csv",sep=path_sep))

#look at data
head(d)
str(d)
unique(d$subject)
length(unique(d$subject))

#center some variables
test_d <- d %>%
  filter(trialType=="test") %>%
  mutate(
    conditionC = case_when(
      condition  == "massed" ~ 0.5,
      condition == "interleaved" ~ -0.5),
    math_conditionC = case_when(
      math_condition=="math" ~ 0.5,
      math_condition=="no_math" ~ -0.5))

#### check catch trials/ familiar test trials ####

#inspect audio check trials
audioCheck <- d %>%
  filter(trial_type=="audio-check") %>%
  select(subject,qualtricsId,stimulus,response) %>%
  pivot_wider(names_from=stimulus,values_from=response)

#exclude_list
subj_to_exclude <- c()

testSubj<- d %>%
  subset(trial_type=="comprehension-test") %>%
  #filter(!(subject %in% subj_to_exclude)) %>%
  group_by(subject,condition,math_condition,list_num,set_num,trialType) %>%
  summarize(n=n(),accuracy=mean(isRight))

testSubj <- merge(testSubj,audioCheck)

#check accuracy on familiar trials
mean(filter(testSubj,trialType=="familiar_test")$accuracy)


#### summarize accuracy by condition ####

#summarize subject data
sum_subj_accuracy <- testSubj %>%
  filter(trialType=="test") %>%
  group_by(condition,math_condition) %>%
  summarize(overall_accuracy=mean(accuracy),se=se(accuracy))
  
#ggplot 
ggplot(sum_subj_accuracy,aes(condition,overall_accuracy,fill=condition))+
  geom_bar(stat="identity", color="black",size=1.5, width=0.5)+
  geom_dotplot(data=filter(testSubj, trialType=="test"),aes(x=condition,y=accuracy),stackdir="center", binaxis="y",dotsize=0.5)+
  geom_errorbar(aes(ymin=overall_accuracy-se,ymax=overall_accuracy+se),width=0.05, size=1.2)+
  geom_hline(yintercept=0.5, linetype="dashed",size=1.2)+
  theme(legend.position="none")+
  xlab("Condition")+
  ylab("Overall Mean Test Accuracy")+
  facet_wrap(~math_condition)
ggsave("figures/CrossSitRepMem_v1.jpeg",width=10, height=5)

#summarize subject data
sum_subj_accuracy <- testSubj %>%
  filter(trialType=="test") %>%
  group_by(condition,math_condition,list_num,set_num) %>%
  summarize(overall_accuracy=mean(accuracy),se=se(accuracy))

#by list and set
ggplot(sum_subj_accuracy,aes(condition,overall_accuracy,fill=condition))+
  geom_bar(stat="identity", color="black",size=1.5, width=0.5)+
  geom_dotplot(data=filter(testSubj, trialType=="test"),aes(x=condition,y=accuracy),stackdir="center", binaxis="y",dotsize=1)+
  geom_errorbar(aes(ymin=overall_accuracy-se,ymax=overall_accuracy+se),width=0.05, size=1.2)+
  geom_hline(yintercept=0.5, linetype="dashed",size=1.2)+
  theme(legend.position="none")+
  xlab("Condition")+
  ylab("Overall Mean Test Accuracy")+
  facet_grid(math_condition~list_num+set_num)
ggsave("figures/CrossSitRepMem_v1_checkListEffects.jpeg",width=10, height=5)

#pre-registered model
#center condition and math condition
#step 1 - does  not converge
m <- glmer(isRight~conditionC*math_conditionC+(1|subject)+(1+conditionC*math_conditionC|targetImage),data=test_d, family=binomial)
summary(m)
#step2 - does not converge
m <- glmer(isRight~conditionC*math_conditionC+(1|subject)+(1+conditionC:math_conditionC|targetImage),data=test_d, family=binomial)
summary(m)
#step3a - singular fit
m <- glmer(isRight~conditionC*math_conditionC+(1|subject)+(1+math_conditionC|targetImage),data=test_d, family=binomial)
summary(m)
#step3b - does not converge
m <- glmer(isRight~conditionC*math_conditionC+(1|subject)+(1+conditionC|targetImage),data=test_d, family=binomial)
summary(m)
#step4
m <- glmer(isRight~conditionC*math_conditionC+(1|subject)+(1|targetImage),data=test_d, family=binomial)
summary(m)

####just no math condition (replication) ###
#step 1 - does not converge
m <- glmer(isRight~conditionC+(1|subject)+(1+conditionC|targetImage),data=filter(test_d, math_conditionC==-0.5), family=binomial)
summary(m)
#step 2 - singular fit
m <- glmer(isRight~conditionC+(1|subject)+(1|targetImage),data=filter(test_d, math_conditionC==-0.5), family=binomial)
summary(m)
#step 3
m <- glmer(isRight~conditionC+(1|subject),data=filter(test_d, math_conditionC==-0.5), family=binomial)
summary(m)

####just math condition###
#step 1 - does not converge
m <- glmer(isRight~conditionC+(1|subject)+(1+conditionC|targetImage),data=filter(test_d, math_conditionC==0.5), family=binomial)
summary(m)
#step 2
m <- glmer(isRight~conditionC+(1|subject)+(1|targetImage),data=filter(test_d, math_conditionC==0.5), family=binomial)
summary(m)


#### look at time and math accuracy ####
subj_math_accuracy <- d %>%
  subset(trial_type=="production-math") %>%
  group_by(subject,condition,math_condition,list_num,set_num) %>%
  summarize(math_accuracy=mean(solution==correct_solution,na.rm=T))
hist(subj_math_accuracy$math_accuracy)

subj_time_elapsed <- d  %>%
  group_by(subject,condition,math_condition,list_num,set_num) %>%
  summarize(study_duration=time_elapsed[trial_type=="survey-text"]-time_elapsed[1], study_duration_min=study_duration/1000/60)

#plot time spent on task
ggplot(filter(subj_time_elapsed, study_duration_min<30),aes(condition,study_duration_min, color=condition))+
  geom_violin()+
  geom_jitter(width=0.1)+
  facet_wrap(~math_condition)+
  theme(legend.position="none")

testSubj <- testSubj %>%
  left_join(subj_math_accuracy) %>%
  left_join(subj_time_elapsed)

#plot massed vs. interleaved effect across math accuracy
ggplot(filter(testSubj, trialType=="test"), aes(math_accuracy,accuracy, color=condition,group=condition))+
  geom_jitter(width=0.01,height=0.01)+
  geom_smooth(method="lm")
ggsave("figures/CrossSitRepMem_v1_conditionEffectByMathAccuracy.jpeg",width=10, height=5)

ggplot(filter(testSubj, trialType=="test"&math_accuracy>0.5), aes(math_accuracy,accuracy, color=condition,group=condition))+
  geom_jitter(width=0.01,height=0.01)+
  geom_smooth(method="lm")

sum_subj_accuracy_perfectMath <- filter(testSubj, math_accuracy==1|is.na(math_accuracy)) %>%
  filter(trialType=="test") %>%
  group_by(condition,math_condition) %>%
  summarize(n=n(),overall_accuracy=mean(accuracy),se=se(accuracy))


ggplot(sum_subj_accuracy_perfectMath,aes(condition,overall_accuracy,fill=condition))+
  geom_bar(stat="identity", color="black",size=1.5, width=0.5)+
  geom_dotplot(data=filter(testSubj, trialType=="test"&(math_accuracy==1|is.na(math_accuracy))),aes(x=condition,y=accuracy),stackdir="center", binaxis="y",dotsize=0.5)+
  geom_errorbar(aes(ymin=overall_accuracy-se,ymax=overall_accuracy+se),width=0.05, size=1.2)+
  geom_hline(yintercept=0.5, linetype="dashed",size=1.2)+
  theme(legend.position="none")+
  xlab("Condition")+
  ylab("Overall Mean Test Accuracy")+
  facet_wrap(~math_condition)
ggsave("figures/CrossSitRepMem_v1_conditionEffectPerfectMathOnly.jpeg",width=10, height=5)

#plot massed vs. interleaved across time spent on task
ggplot(filter(testSubj, trialType=="test"&study_duration_min<30), aes(study_duration_min,accuracy, color=condition,group=condition))+
  geom_jitter(width=0.01,height=0.01)+
  geom_smooth()+
  facet_wrap(~math_condition)
ggsave("figures/CrossSitRepMem_v1_conditionEffectByTimeOnTask.jpeg",width=10, height=5)


ggplot(filter(testSubj, trialType=="test"&study_duration_min<10), aes(study_duration_min,accuracy, color=condition,group=condition))+
  geom_jitter(width=0.01,height=0.01)+
  geom_smooth(method="lm")+
  facet_wrap(~math_condition)

ggplot(filter(testSubj, trialType=="test"&study_duration_min<6), aes(study_duration_min,accuracy, color=condition,group=condition))+
  geom_jitter(width=0.01,height=0.01)+
  geom_smooth()+
  facet_wrap(~math_condition)

