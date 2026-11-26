import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button, Divider } from '@mui/material';
import { AgCharts } from 'ag-charts-react';
import { useGetDashboardDataMutation } from '../../store/mdtSlice';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoading, showLoading } from '../../store/appSlice';
import { FilterAlt } from '@mui/icons-material';
import Filters from './Filters';

const Dashboard = () => {
  const dispatch = useDispatch();

  const [dashboardData, setDashboardData] = useState(null);
  const [quickStats, setQuickStats] = useState([]);
  const [executionTrend, setExecutionTrend] = useState([]);

  const [dataTestCaseDistribution, setDataTestCaseDistribution] = useState(null);
  const [irisTestCaseDistribution, setIrisTestCaseDistribution] = useState(null);
  const [nexusTestCaseDistribution, setNexusTestCaseDistribution] = useState(null);

  const [getDashboardData] = useGetDashboardDataMutation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [domainName, setDomainName] = useState([]);
  const [subDomainName, setSubDomainName] = useState([]);

  const { selectedOrgAppDetails } = useSelector((state) => state.data); 
  
  useEffect(() => {
    if (selectedOrgAppDetails && selectedOrgAppDetails.orgName !== "" && selectedOrgAppDetails.appName !== "") {
      setDomainName([selectedOrgAppDetails.orgName]);
      setSubDomainName([selectedOrgAppDetails.appName]);
      fetchDashboardData(null, null, [selectedOrgAppDetails.orgName], [selectedOrgAppDetails.appName]);
    }
  }, [selectedOrgAppDetails]);


  useEffect(() => {
    if (dashboardData) {
      const stats = [
        {
          title: 'Test Cases Overview',
          primaryValue: dashboardData?.quick_stats?.test_cases || 0,
          secondaryValue: dashboardData?.quick_stats?.executed || 0,
          primaryLabel: 'Total',
          secondaryLabel: 'Executed',
          icon: '📊',
          gradient: { start: '#1a1a2e', end: '#16213e' }
        },
        {
          title: 'Test Results',
          primaryValue: dashboardData?.quick_stats?.pass || 0,
          secondaryValue: dashboardData?.quick_stats?.fail || 0,
          primaryLabel: 'Passed',
          secondaryLabel: 'Failed',
          tertiaryLabel: 'Flaky',
          tertiaryValue: dashboardData?.quick_stats?.flaky || 0,
          icon: '📈',
          gradient: { start: '#0a4f4f', end: '#7d0633' }
        },
        {
          title: 'Jaas Ticket Status',
          primaryValue: (dashboardData?.jass_details_report?.in_progress || 0) + (dashboardData?.jass_details_report?.to_do || 0),
          secondaryValue: dashboardData?.jass_details_report?.done || 0,
          primaryLabel: 'In Prog/Todo',
          secondaryLabel: 'Done',
          icon: '🎯',
          gradient: { start: '#1e3a8a', end: '#581c87' }
        },
        {
          title: 'Avg Execution Time',
          value: convertSecToReadableTime(dashboardData?.quick_stats?.avg_execution_time_sec) || 0,
          icon: '⏱️',
          gradient: { start: '#064e3b', end: '#047857' }
        },
      ];
      setQuickStats(stats);

      const executionTrendData = [];
      for (let trend in dashboardData?.execution_trends) {
        executionTrendData.push({
          date: trend,
          pass: dashboardData?.execution_trends[trend]?.Pass || 0,
          fail: dashboardData?.execution_trends[trend]?.Fail || 0,
          flaky: dashboardData?.execution_trends[trend]?.Flaky || 0,
        });
      }
      setExecutionTrend(executionTrendData);
      
      setDataTestCaseDistribution(dashboardData?.test_details?.find(item => item.test_type === 'Data_Testing') || null);
      setIrisTestCaseDistribution(dashboardData?.test_details?.find(item => item.test_type === 'Iris') || null);
      setNexusTestCaseDistribution(dashboardData?.test_details?.find(item => item.test_type === 'Nexus') || null);
    }
  }, [dashboardData]);

  const convertSecToReadableTime = (sec) => {
    if (sec === null || sec === undefined) return "0s";
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${Math.round(seconds * 100 / 100)}s`;
  };

  const fetchDashboardData = async (from = fromDate, to = toDate, dom = domainName, subDom = subDomainName) => {
    try {
      dispatch(showLoading());
      let filters = {};
      if (from && to) {
        filters.start_date = new Date(from.setHours(23, 59, 59, 999)).toISOString().split('T')[0];
        filters.end_date = new Date(to.setHours(23, 59, 59, 999)).toISOString().split('T')[0];
      }
      if (userEmail) {
        filters.user_email = userEmail;
      }
      if (dom.length > 0) {
        filters.domain_name = dom;
      }
      if (subDom.length > 0) {
        filters.sub_domain_name = subDom;
      }
      const { data: response, error } = await getDashboardData({
        function_name: "get_dashboard_stats",
        user_id: sessionStorage.getItem("username"),
        filters
      });
      
      if (response) {
        setDashboardData(response);
        dispatch(closeLoading());
      }
      if (!!error) throw error;
    } catch (error) {
      console.error("Error fetching Nexus domains:", error);
      dispatch(closeLoading());
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleApplyFilter = () => {
    if (userEmail && !validateEmail(userEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    fetchDashboardData(fromDate, toDate, domainName, subDomainName);
    setDrawerOpen(false);
  };

  const handleClearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setUserEmail("");
    setEmailError("");
    setDomainName([selectedOrgAppDetails.orgName]);
    setSubDomainName([selectedOrgAppDetails.appName]);
    setTimeout(() => {
      fetchDashboardData(null, null, [selectedOrgAppDetails.orgName], [selectedOrgAppDetails.appName]);
    }, 100); // Delay to ensure state is reset before fetching, change this and send data as argument to fetchDashboardData
  };

  return (
    <Container sx={{ position: "relative", marginTop: "80px" }}>
      {/* Sticky Vertical Filter Button */}
      {!drawerOpen && (
        <Box
          sx={{
            position: "fixed",
            top: "30%",
            right: 0,
            zIndex: 1301,
            transform: "translateY(-50%)",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{
              borderRadius: "8px 0 0 8px",
              minHeight: 120,
              minWidth: 40,
              px: 0,
              py: 0,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontWeight: 600,
              letterSpacing: 2,
              boxShadow: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FilterAlt sx={{ fontSize: 20, transform: "rotate(90deg)", }} />
            Filters
          </Button>
        </Box>
      )}

      <Filters 
        setDrawerOpen={setDrawerOpen} 
        drawerOpen={drawerOpen} 
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        emailError={emailError}
        setEmailError={setEmailError}
        handleApplyFilter={handleApplyFilter}
        handleClearFilter={handleClearFilter}
        domainName={domainName}
        setDomainName={setDomainName}
        subDomainName={subDomainName}
        setSubDomainName={setSubDomainName}
        fromDate={fromDate}/>

      {/* Enhanced Quick Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickStats.map((card, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            lg={3}
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Card 
              sx={{ 
                height: 220,
                minHeight: 220,
                background: `linear-gradient(135deg, ${card.gradient.start} 0%, ${card.gradient.end} 100%)`,
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                },
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <CardContent sx={{ 
                height: '100%',
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between", 
                alignItems: "center",
                p: 3,
                position: 'relative',
                zIndex: 1,
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  width: '100%',
                  mb: 2
                }}>
                  <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    opacity: 0.95,
                    textAlign: 'left',
                  }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ 
                    fontSize: '1.8rem',
                    opacity: 0.9,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                  }}>
                    {card.icon}
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  {card.primaryValue !== undefined ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 2
                    }}>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h3" component="div" sx={{ 
                          fontWeight: 800,
                          fontSize: '2.2rem',
                          lineHeight: 1,
                          mb: 0.5,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {card.primaryValue}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          opacity: 0.8,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          {card.primaryLabel}
                        </Typography>
                      </Box>
                      
                      <Divider orientation="vertical" flexItem sx={{ 
                        borderColor: 'rgba(255,255,255,0.3)',
                        height: '60px'
                      }} />
                      
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="h3" component="div" sx={{ 
                          fontWeight: 800,
                          fontSize: '2.2rem',
                          lineHeight: 1,
                          mb: 0.5,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                          {card.secondaryValue}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          opacity: 0.8,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}>
                          {card.secondaryLabel}
                        </Typography>
                      </Box>

                      {card.tertiaryValue !== undefined && (
                        <>
                          <Divider orientation="vertical" flexItem sx={{ 
                            borderColor: 'rgba(255,255,255,0.3)',
                            height: '60px'
                          }} />

                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography variant="h3" component="div" sx={{ 
                              fontWeight: 800,
                              fontSize: '2.2rem',
                              lineHeight: 1,
                              mb: 0.5,
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                              {card.tertiaryValue}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              opacity: 0.8,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5
                            }}>
                              {card.tertiaryLabel}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" component="div" sx={{ 
                        fontWeight: 800,
                        fontSize: '2.5rem',
                        lineHeight: 1,
                        mb: 0.5,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Average
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Donut Charts Section */}
      <Box sx={{ 
        mt: 4,
        animation: 'slideUp 0.8s ease-in-out 0.2s both',
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          // overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" component="div" sx={{ 
              mb: 3,
              fontWeight: 600,
              color: '#1a1a2e',
              textAlign: 'center'
            }}>
              Test Case Distribution
            </Typography>
            
            <Grid container spacing={3} sx={{pb: 2}}>
              <Grid item xs={12} md={4}>
                {dataTestCaseDistribution !== null && 
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    height: '100%'
                  }}>
                    
                      <TestCaseDistributionMultiDonut data={dataTestCaseDistribution} title={"Data Testing"} />
                  </Box>
                }
              </Grid>
              <Grid item xs={12} md={4}>
                {irisTestCaseDistribution !== null && 
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    height: '100%'
                  }}>
                    
                      <TestCaseDistributionMultiDonut data={irisTestCaseDistribution} title={"Iris Testing"} />
                  </Box>
                }
              </Grid>
              <Grid item xs={12} md={4}>
                {nexusTestCaseDistribution !== null && 
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    height: '100%'
                  }}>
                    
                      <TestCaseDistributionMultiDonut data={nexusTestCaseDistribution} title={"Nexus Testing"} />
                  </Box>
                }
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Execution Trend Section */}
      <Box sx={{ 
        mt: 4,
        mb: 8,
        animation: 'slideUp 0.8s ease-in-out 0.4s both',
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              mb: 3
            }}>
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 600,
                color: '#1a1a2e'
              }}>
                Execution Trend Analysis
              </Typography>
              {/* <Box sx={{ 
                display: 'flex',
                gap: 1,
                alignItems: 'center'
              }}>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981' 
                }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Passed
                </Typography>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#ef4444' 
                }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Failed
                </Typography>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  backgroundColor: '#f59e0b' 
                }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Flaky
                </Typography>
              </Box> */}
            </Box>
            <TestCaseExecutionTrend data={executionTrend} />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

const TestCaseExecutionTrend = ({data}) => {
  const [options, setOptions] = useState({});

  useEffect(() => {
    setOptions({
      data,
      title: {
        text: "Execution Trend",
        fontSize: 18,
        fontWeight: 600,
        color: '#1a1a2e'
      },
      background: {
        fill: 'transparent'
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 60
      },
      series: [
        { 
          type: "bar", 
          xKey: "date", 
          yKey: "pass", 
          yName: "Passed",
          fill: '#10b981',
          // strokeWidth: 3,
          // marker: {
          //   size: 6,
          //   fill: '#10b981',
          //   stroke: '#ffffff',
          //   strokeWidth: 2
          // },
          stacked: true
        },
        { 
          type: "bar", 
          xKey: "date", 
          yKey: "fail", 
          yName: "Failed", 
          fill: '#ef4444',
          // strokeWidth: 3,
          // marker: {
          //   size: 6,
          //   fill: '#ef4444',
          //   stroke: '#ffffff',
          //   strokeWidth: 2
          // },
          stacked: true
        },
        { 
          type: "bar", 
          xKey: "date", 
          yKey: "flaky", 
          yName: "Flaky", 
          fill: '#f59e0b',
          // strokeWidth: 3,
          // marker: {
          //   size: 6,
          //   fill: '#f59e0b',
          //   stroke: '#ffffff',
          //   strokeWidth: 2
          // },
          stacked: true
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          gridStyle: {
            stroke: '#e5e7eb',
            lineDash: [2, 2]
          },
          label: {
            rotation: -45,
            fontSize: 11,
            color: '#6b7280'
          }
        },
        {
          type: 'number',
          position: 'left',
          gridStyle: {
            stroke: '#e5e7eb',
            lineDash: [2, 2]
          },
          label: {
            fontSize: 11,
            color: '#6b7280'
          }
        }
      ],
      legend: {
        position: 'top',
        spacing: 20,
        item: {
          label: {
            fontSize: 12,
            fontWeight: 500
          }
        }
      }
    });
  }, [data]);

  return (
    <Box sx={{ 
      width: "100%", 
      height: 400, 
      display: "flex",
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <AgCharts options={options} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

const TestCaseDistributionMultiDonut = ({title, data}) => {
  const [options, setOptions] = useState({});
  useEffect(() => {
    setOptions({
      data: [
      { status: "Passed", count: data?.passed || 0, color: '#10b981' },
      { status: "Failed", count: data?.failed || 0, color: '#ef4444' },
      { status: "Executed", count: data?.executed || 0, color: '#f59e0b' },
      // { status: "Total", count: data?.total || 0, color: '#6b7280' },
      ],
      title: {
        text: title,
        fontSize: 16,
        fontWeight: 600,
        color: '#1a1a2e'
      },
      background: {
        fill: 'transparent'
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      series: [
        { 
          type: "donut", 
          calloutLabelKey: "status", 
          angleKey: "count", 
          innerRadiusRatio: 0.6,
          outerRadiusRatio: 0.8,
          fills: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
          strokes: ['#ffffff'],
          strokeWidth: 2,
          calloutLabel: {
            fontSize: 11,
            fontWeight: 500,
            color: '#374151'
          },
          sectorLabel: {
            fontSize: 12,
            fontWeight: 600,
            color: '#ffffff'
          }
        }
      ],
      legend: {
        position: 'bottom',
        spacing: 10,
        item: {
          label: {
            fontSize: 11,
            fontWeight: 500
          },
          marker: {
            size: 10
          }
        }
      }
    });
  }, [data, title]);  

  return (
    <Box sx={{ 
      width: "100%", 
      height: 300, 
      display: "flex",
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <AgCharts options={options} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

export default Dashboard;
